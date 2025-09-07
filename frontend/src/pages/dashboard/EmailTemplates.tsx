import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import RichTextEditor from '../../components/ui/RichTextEditor';

interface EmailTemplate {
  id: number;
  template_key: string;
  name: string;
  subject: string;
  body_html: string;
  description?: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{subject: string, body: string} | null>(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/email-templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const templates = data.data || data;
        
        // Parse variables JSON for each template
        const parsedTemplates = templates.map((template: any) => {
          let variables = [];
          try {
            if (typeof template.variables === 'string') {
              variables = JSON.parse(template.variables);
            } else if (Array.isArray(template.variables)) {
              variables = template.variables;
            }
          } catch (e) {
            console.error('Error parsing variables for template:', template.id, e);
            variables = [];
          }
          
          return {
            ...template,
            variables
          };
        });
        
        setTemplates(parsedTemplates);
      } else {
        setError('Failed to load templates');
      }
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (template: EmailTemplate) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/email-templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: template.name,
          subject: template.subject,
          body_html: template.body_html,
          description: template.description,
          variables: template.variables,
          is_active: template.is_active
        }),
      });

      if (response.ok) {
        await loadTemplates();
        setError(null);
        alert('Template saved successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save template');
      }
    } catch (err) {
      setError('Failed to save template');
      console.error('Error saving template:', err);
    } finally {
      setSaving(false);
    }
  };

  const testTemplate = async (templateKey: string) => {
    try {
      const token = localStorage.getItem('token');
      const testVariables = {
        sender_name: 'John Doe',
        sender_email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message to preview the email template.',
        business_name: 'Test Business',
        verification_link: 'https://example.com/verify',
        reset_link: 'https://example.com/reset',
        preferred_language: 'English'
      };

      const response = await fetch(`/api/admin/email-templates/test/${templateKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ variables: testVariables }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.data || data);
        setShowPreview(true);
      } else {
        setError('Failed to test template');
      }
    } catch (err) {
      setError('Failed to test template');
      console.error('Error testing template:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage email templates sent by the system
          </p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="flex">
          {/* Template List */}
          <div className="w-1/3 border-r border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Templates</h2>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.template_key}</div>
                    <div className={`text-xs font-medium mt-1 ${
                      template.is_active ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Template Editor */}
          <div className="w-2/3">
            {selectedTemplate ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Edit Template: {selectedTemplate.name}
                  </h2>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => testTemplate(selectedTemplate.template_key)}
                      variant="outline"
                      size="sm"
                    >
                      Preview
                    </Button>
                    <Button
                      onClick={() => saveTemplate(selectedTemplate)}
                      disabled={saving}
                      size="sm"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  {/* Template Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        name: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={selectedTemplate.subject}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        subject: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Use {variable} for dynamic content"
                    />
                  </div>

                  {/* Body HTML */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Body
                    </label>
                    <RichTextEditor
                      value={selectedTemplate.body_html}
                      onChange={(value) => setSelectedTemplate({
                        ...selectedTemplate,
                        body_html: value
                      })}
                      variables={Array.isArray(selectedTemplate.variables) ? selectedTemplate.variables : []}
                      placeholder="Start typing your email content..."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={selectedTemplate.description || ''}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        description: e.target.value
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe when this template is used"
                    />
                  </div>

                  {/* Variables */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Variables
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(selectedTemplate.variables) ? selectedTemplate.variables : []).map((variable) => (
                        <span
                          key={variable}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-mono"
                        >
                          {'{' + variable + '}'}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      These variables will be replaced with actual values when emails are sent
                    </p>
                  </div>

                  {/* Active Status */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTemplate.is_active}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          is_active: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Template is active
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Only active templates are used by the system
                    </p>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <div className="text-gray-300 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <p>Select a template to edit</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl max-h-screen overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Email Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <strong>Subject:</strong> {previewData.subject}
              </div>
              <div 
                className="border border-gray-200 rounded p-4 bg-gray-50"
                style={{
                  lineHeight: '1.6',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                <div 
                  dangerouslySetInnerHTML={{ __html: previewData.body }}
                  style={{
                    // Fix button and text overlap issues
                  }}
                />
                <style>{`
                  .bg-gray-50 a[style*="background"] {
                    display: inline-block !important;
                    margin: 12px 8px 12px 0 !important;
                    padding: 12px 24px !important;
                    clear: left !important;
                    float: none !important;
                    vertical-align: baseline !important;
                  }
                  .bg-gray-50 p {
                    margin: 16px 0 !important;
                    clear: both !important;
                  }
                  .bg-gray-50 div[style*="background"] {
                    margin: 16px 0 !important;
                    padding: 16px !important;
                    clear: both !important;
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;