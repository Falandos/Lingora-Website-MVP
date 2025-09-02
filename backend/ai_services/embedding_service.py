#!/usr/bin/env python3
"""
AI-Powered Semantic Search Service for Lingora
=============================================

This service provides multilingual semantic search capabilities using sentence transformers.
It generates embeddings for provider content and enables semantic similarity search.

Features:
- Multi-language understanding (Dutch, English, Arabic, Chinese, etc.)
- Fast embedding generation with caching
- Semantic similarity search
- RESTful API for PHP integration
- Future-ready translation capabilities

Usage:
    python embedding_service.py

API Endpoints:
    POST /embed - Generate embeddings for text
    POST /search - Find similar providers using semantic search
    POST /translate - Future: Translate text between languages
    GET /health - Service health check
"""

import os
import json
import hashlib
import logging
import mysql.connector
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Flask app configuration
app = Flask(__name__)
CORS(app)  # Enable CORS for PHP integration

# Global model - loaded once for performance
model = None
MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'lingora',
    'user': 'root',
    'password': '',  # XAMPP default
    'charset': 'utf8mb4'
}

class EmbeddingCache:
    """Simple in-memory cache for embeddings to improve performance"""
    
    def __init__(self, max_size=1000, ttl_hours=24):
        self.cache = {}
        self.max_size = max_size
        self.ttl_seconds = ttl_hours * 3600
        
    def get(self, text_hash):
        """Get cached embedding if available and not expired"""
        if text_hash in self.cache:
            embedding, timestamp = self.cache[text_hash]
            if datetime.now().timestamp() - timestamp < self.ttl_seconds:
                return embedding
            else:
                del self.cache[text_hash]
        return None
        
    def set(self, text_hash, embedding):
        """Cache embedding with timestamp"""
        if len(self.cache) >= self.max_size:
            # Remove oldest entry
            oldest_key = min(self.cache.keys(), 
                            key=lambda k: self.cache[k][1])
            del self.cache[oldest_key]
        
        self.cache[text_hash] = (embedding, datetime.now().timestamp())

# Global embedding cache
embedding_cache = EmbeddingCache()

def load_model():
    """Load the multilingual sentence transformer model"""
    global model
    if model is None:
        logger.info(f"Loading model: {MODEL_NAME}")
        try:
            model = SentenceTransformer(MODEL_NAME)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise
    return model

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise

def calculate_content_hash(text):
    """Calculate MD5 hash for content change detection"""
    return hashlib.md5(text.encode('utf-8')).hexdigest()

@app.route('/test_simple', methods=['POST'])
def test_simple():
    """Simple test endpoint"""
    try:
        data = request.get_json()
        text = data.get('text', 'test')
        
        model = load_model()
        logger.info(f"Testing embedding for: {text}")
        
        # Try direct encoding
        embedding = model.encode(text)
        logger.info(f"Embedding generated, shape: {embedding.shape}")
        
        # Convert to simple list
        result = embedding.tolist()
        logger.info(f"Converted to list, length: {len(result)}")
        
        return jsonify({
            'success': True,
            'test': 'passed',
            'embedding_length': len(result)
        })
        
    except Exception as e:
        import traceback
        logger.error(f"Test failed: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test model loading
        model = load_model()
        
        # Test database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': 'healthy',
            'model': MODEL_NAME,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/embed', methods=['POST'])
def generate_embedding():
    """
    Generate embedding for given text
    
    Request JSON:
    {
        "text": "Find doctors who speak Arabic",
        "cache_key": "optional_cache_key",
        "language": "auto"  // auto-detect or specify
    }
    
    Response JSON:
    {
        "success": true,
        "embedding": [0.1, 0.2, ...],  // 384-dimensional vector
        "dimensions": 384,
        "processing_time": 0.05
    }
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'Text is required'
            }), 400
            
        text = data['text'].strip()
        if not text:
            return jsonify({
                'success': False,
                'error': 'Text cannot be empty'
            }), 400
        
        start_time = datetime.now()
        
        # Check cache first
        text_hash = calculate_content_hash(text)
        cached_embedding = embedding_cache.get(text_hash)
        
        if cached_embedding is not None:
            logger.info(f"Cache hit for text hash: {text_hash}")
            # Convert cached numpy array to Python list safely
            cached_list = [float(x) for x in cached_embedding]
            
            return jsonify({
                'success': True,
                'embedding': cached_list,
                'dimensions': len(cached_list),
                'processing_time': (datetime.now() - start_time).total_seconds(),
                'cached': True
            })
        
        # Generate new embedding
        model = load_model()
        embedding = model.encode(text)
        
        # Cache the result
        embedding_cache.set(text_hash, embedding)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"Generated embedding for text ({len(text)} chars) in {processing_time:.3f}s")
        
        # Convert numpy array to Python list safely
        embedding_list = [float(x) for x in embedding]
        
        return jsonify({
            'success': True,
            'embedding': embedding_list,
            'dimensions': len(embedding_list),
            'processing_time': processing_time,
            'cached': False
        })
        
    except Exception as e:
        import traceback
        logger.error(f"Embedding generation failed: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/search', methods=['POST'])
def semantic_search():
    """
    Perform semantic search against provider embeddings
    
    Request JSON:
    {
        "query": "looking for a doctor who speaks Arabic",
        "limit": 20,
        "threshold": 0.3,  // minimum similarity score
        "filter": {
            "provider_ids": [1, 2, 3],  // optional filter
            "languages": ["ar", "en"],   // optional filter
            "categories": [1, 2]         // optional filter
        }
    }
    
    Response JSON:
    {
        "success": true,
        "results": [
            {
                "provider_id": 1,
                "similarity_score": 0.87,
                "searchable_text": "Medical clinic with Arabic-speaking doctors...",
                "language": "multi"
            }
        ],
        "query_processing_time": 0.05,
        "total_results": 15
    }
    """
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({
                'success': False,
                'error': 'Query is required'
            }), 400
        
        query = data['query'].strip()
        limit = data.get('limit', 20)
        threshold = data.get('threshold', 0.3)
        filters = data.get('filter', {})
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query cannot be empty'
            }), 400
        
        start_time = datetime.now()
        
        # Generate query embedding
        model = load_model()
        query_embedding = model.encode(query)
        
        # Get provider embeddings from database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Build SQL query with optional filters
        sql = """
            SELECT pe.provider_id, pe.embedding_vector, pe.searchable_text, pe.language
            FROM provider_embeddings pe
            JOIN providers p ON pe.provider_id = p.id
            WHERE p.status = 'approved' AND p.subscription_status != 'frozen'
        """
        params = []
        
        # Apply optional filters
        if 'provider_ids' in filters and filters['provider_ids']:
            placeholders = ','.join(['%s'] * len(filters['provider_ids']))
            sql += f" AND pe.provider_id IN ({placeholders})"
            params.extend(filters['provider_ids'])
            
        if 'languages' in filters and filters['languages']:
            # This would require joining with provider_languages table
            placeholders = ','.join(['%s'] * len(filters['languages']))
            sql += f"""
                AND EXISTS (
                    SELECT 1 FROM provider_languages pl 
                    WHERE pl.provider_id = pe.provider_id 
                    AND pl.language_code IN ({placeholders})
                )
            """
            params.extend(filters['languages'])
        
        cursor.execute(sql, params)
        provider_embeddings = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if not provider_embeddings:
            return jsonify({
                'success': True,
                'results': [],
                'query_processing_time': (datetime.now() - start_time).total_seconds(),
                'total_results': 0
            })
        
        # Calculate similarities
        results = []
        for provider in provider_embeddings:
            try:
                # Parse stored embedding JSON
                stored_embedding = np.array(json.loads(provider['embedding_vector']))
                
                # Calculate cosine similarity
                similarity = cosine_similarity(
                    query_embedding.reshape(1, -1),
                    stored_embedding.reshape(1, -1)
                )[0][0]
                
                if similarity >= threshold:
                    results.append({
                        'provider_id': provider['provider_id'],
                        'similarity_score': float(similarity),
                        'searchable_text': provider['searchable_text'],
                        'language': provider['language']
                    })
                    
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Invalid embedding for provider {provider['provider_id']}: {str(e)}")
                continue
        
        # Sort by similarity score (highest first) and limit results
        results.sort(key=lambda x: x['similarity_score'], reverse=True)
        results = results[:limit]
        
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"Semantic search completed in {processing_time:.3f}s, found {len(results)} results")
        
        return jsonify({
            'success': True,
            'results': results,
            'query_processing_time': processing_time,
            'total_results': len(results)
        })
        
    except Exception as e:
        logger.error(f"Semantic search failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/batch_embed', methods=['POST'])
def batch_generate_embeddings():
    """
    Generate embeddings for multiple providers (used for initial data migration)
    
    Request JSON:
    {
        "providers": [
            {
                "provider_id": 1,
                "searchable_text": "Medical clinic with multilingual staff...",
                "language": "multi"
            }
        ]
    }
    
    Response JSON:
    {
        "success": true,
        "processed": 10,
        "failed": 0,
        "processing_time": 2.34
    }
    """
    try:
        data = request.get_json()
        if not data or 'providers' not in data:
            return jsonify({
                'success': False,
                'error': 'Providers data is required'
            }), 400
        
        providers = data['providers']
        if not isinstance(providers, list):
            return jsonify({
                'success': False,
                'error': 'Providers must be an array'
            }), 400
        
        start_time = datetime.now()
        processed = 0
        failed = 0
        
        model = load_model()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for provider_data in providers:
            try:
                provider_id = provider_data['provider_id']
                searchable_text = provider_data['searchable_text']
                language = provider_data.get('language', 'multi')
                
                if not searchable_text.strip():
                    failed += 1
                    continue
                
                # Generate embedding
                embedding = model.encode(searchable_text)
                content_hash = calculate_content_hash(searchable_text)
                
                # Store in database
                sql = """
                    INSERT INTO provider_embeddings 
                    (provider_id, content_hash, embedding_vector, searchable_text, language)
                    VALUES (%s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                    content_hash = VALUES(content_hash),
                    embedding_vector = VALUES(embedding_vector),
                    searchable_text = VALUES(searchable_text),
                    language = VALUES(language),
                    updated_at = CURRENT_TIMESTAMP
                """
                
                cursor.execute(sql, (
                    provider_id,
                    content_hash,
                    json.dumps(embedding.tolist()),
                    searchable_text,
                    language
                ))
                
                processed += 1
                
            except Exception as e:
                logger.error(f"Failed to process provider {provider_data.get('provider_id')}: {str(e)}")
                failed += 1
        
        conn.commit()
        cursor.close()
        conn.close()
        
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"Batch embedding completed: {processed} processed, {failed} failed in {processing_time:.3f}s")
        
        return jsonify({
            'success': True,
            'processed': processed,
            'failed': failed,
            'processing_time': processing_time
        })
        
    except Exception as e:
        logger.error(f"Batch embedding failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/translate', methods=['POST'])
def translate_text():
    """
    Future translation endpoint - placeholder for MVP+
    
    This will use the same multilingual model infrastructure to provide
    translation services for UI text and provider content.
    """
    return jsonify({
        'success': False,
        'error': 'Translation service not yet implemented - coming in MVP+',
        'planned_features': [
            'Real-time text translation',
            'UI string management',
            'Provider content translation',
            'Cached translation storage'
        ]
    }), 501

if __name__ == '__main__':
    try:
        logger.info("Starting Lingora AI Embedding Service")
        logger.info(f"Model: {MODEL_NAME}")
        
        # Load and warm up the model BEFORE Flask starts
        logger.info("Loading and warming up the model...")
        model = load_model()
        
        # CRITICAL: Warm up the model to prevent threading issues
        warmup_text = "test"
        warmup_result = model.encode(warmup_text)
        logger.info(f"Model warmup successful! Embedding dimensions: {len(warmup_result)}")
        
        # Test database connection
        conn = get_db_connection()
        conn.close()
        logger.info("Database connection successful")
        
        logger.info("Service initialization complete - ready to serve requests")
        
        # Start Flask server
        app.run(
            host='127.0.0.1',
            port=5001,
            debug=False,  # Set to True for development
            threaded=True  # Enable threading for better performance
        )
        
    except Exception as e:
        logger.error(f"Service startup failed: {str(e)}")
        exit(1)