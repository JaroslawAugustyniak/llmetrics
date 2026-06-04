'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/ui/Modal';
import { getApiKeyStatus, updateApiKeys, type ApiKeyStatus } from '@/lib/actions/apiKeys';
import { useTranslations } from 'next-intl';
import Swal from 'sweetalert2';

type ApiKeysModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ApiKeysModal({
  isOpen,
  onClose,
}: ApiKeysModalProps) {
  const t = useTranslations('profile');
  const tC = useTranslations('common');

  const [formData, setFormData] = useState({
    openai_key: '',
    gemini_key: '',
  });
  const [keyStatus, setKeyStatus] = useState<ApiKeyStatus>({ openai: false, gemini: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadKeyStatus();
    }
  }, [isOpen]);

  const loadKeyStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError(t('savingError'));
        return;
      }
      
      const status = await getApiKeyStatus(token);
      setKeyStatus(status);
      setFormData({
        openai_key: '',
        gemini_key: '',
      });
    } catch {
      setError(t('savingError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError(t('savingError'));
        setIsSubmitting(false);
        return;
      }

      const dataToSend: { openai_key?: string; gemini_key?: string } = {};
      if (formData.openai_key) dataToSend.openai_key = formData.openai_key;
      if (formData.gemini_key) dataToSend.gemini_key = formData.gemini_key;

      if (Object.keys(dataToSend).length === 0) {
        setError(t('apiKeys.noChanges') || 'No keys to update');
        setIsSubmitting(false);
        return;
      }

      await updateApiKeys(token, dataToSend);

      await Swal.fire({
        title: t('apiKeys.successTitle') || 'Success',
        text: t('apiKeys.successMessage') || 'API keys updated successfully',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });

      await loadKeyStatus();
      setFormData({ openai_key: '', gemini_key: '' });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('savingError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('apiKeys.title') || 'API Keys'}
      size="md"
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* OpenAI Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="openai_key"
                className="block text-sm font-medium text-gray-700"
              >
                {t('apiKeys.openaiKey') || 'OpenAI API Key'}
              </label>
              {keyStatus.openai && (
                <span className="text-xs text-green-600">
                  {t('apiKeys.keySet') || '✓ Configured'}
                </span>
              )}
            </div>
            <input
              type="password"
              id="openai_key"
              name="openai_key"
              value={formData.openai_key}
              onChange={handleChange}
              placeholder={keyStatus.openai ? '••••••••' : 'sk-...'}
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {keyStatus.openai
                ? t('apiKeys.leaveEmpty') || 'Leave empty to keep current key'
                : t('apiKeys.notConfigured') || 'Not configured'}
            </p>
          </div>

          {/* Gemini Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="gemini_key"
                className="block text-sm font-medium text-gray-700"
              >
                {t('apiKeys.geminiKey') || 'Gemini API Key'}
              </label>
              {keyStatus.gemini && (
                <span className="text-xs text-green-600">
                  {t('apiKeys.keySet') || '✓ Configured'}
                </span>
              )}
            </div>
            <input
              type="password"
              id="gemini_key"
              name="gemini_key"
              value={formData.gemini_key}
              onChange={handleChange}
              placeholder={keyStatus.gemini ? '••••••••' : 'AIza...'}
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {keyStatus.gemini
                ? t('apiKeys.leaveEmpty') || 'Leave empty to keep current key'
                : t('apiKeys.notConfigured') || 'Not configured'}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? t('apiKeys.saving') || 'Saving...' : t('apiKeys.save') || 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              {tC('cancel') || 'Cancel'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}