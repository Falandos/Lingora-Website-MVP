import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

interface StickySearchBarProps {
  className?: string;
}

export const StickySearchBar = ({ className = '' }: StickySearchBarProps) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show the sticky bar when user scrolls past the hero section (approximately 600px)
      const scrolled = window.scrollY > 600;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    } ${className}`}>
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Left: Logo and key features */}
            <div className="flex items-center gap-6 text-sm">
              <div className="font-bold text-primary-600 cursor-pointer" onClick={() => navigate('/')}>
                Lingora
              </div>
              <div className="hidden md:flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <span>🧠</span>
                  <span>AI Search</span>
                </div>
                <div className="text-gray-400">•</div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary-600">19</span>
                  <span>Businesses</span>
                </div>
                <div className="text-gray-400">•</div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">15+</span>
                  <span>Languages</span>
                </div>
                <div className="text-gray-400">•</div>
                <div className="flex items-center gap-2">
                  <span>💰</span>
                  <span>Free</span>
                </div>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/search')}
                size="sm"
                className="px-4"
              >
                🔍 Search
              </Button>
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                size="sm" 
                className="px-4 hidden sm:block"
              >
                Join as Provider
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickySearchBar;