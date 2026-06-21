import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Download, Upload, Trash2, Info } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import './SettingsPage.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateName, updatePreferences, resetUser, exportData, importData } = useUser();
  const toast = useToast();
  const { t } = useLanguage();
  const [name, setName] = useState(user.name);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useDocumentTitle('Settings');

  const handleNameSave = useCallback(() => {
    if (name.trim()) {
      updateName(name.trim());
      toast.success(t('settings.toast.name_updated', 'Name updated!'));
    }
  }, [name, updateName, t, toast]);

  const handleExport = useCallback(() => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecomirror-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('settings.toast.exported', 'Data exported successfully!'));
  }, [exportData, t, toast]);

  const handleImport = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const result = importData(data);
        if (result.success) {
          toast.success(t('settings.toast.imported', 'Data imported successfully! Refresh to see changes.'));
        } else {
          toast.error(result.message || t('settings.toast.invalid_backup', 'Invalid backup file.'));
        }
      } catch {
        toast.error(t('settings.toast.invalid_backup', 'Invalid backup file.'));
      }
    };
    reader.readAsText(file);
  }, [importData, t, toast]);

  const handleReset = useCallback(() => {
    resetUser();
    toast.info(t('settings.toast.reset_completed', 'All data has been reset.'));
    setShowResetConfirm(false);
    navigate('/');
  }, [resetUser, t, toast, navigate]);

  return (
    <div className="settings page-enter">
      <div className="settings__header">
        <Settings size={24} className="settings__header-icon" />
        <h1>{t('nav.settings', 'Settings')}</h1>
      </div>

      {/* Profile */}
      <GlassCard className="settings__card" delay={0.05}>
        <h3 className="settings__card-title">{t('settings.profile', 'Profile')}</h3>
        <div className="settings__field">
          <label className="settings__label">{t('settings.display_name', 'Display Name')}</label>
          <div className="settings__input-row">
            <input
              type="text"
              className="settings__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('settings.name_placeholder', 'Your name')}
              id="settings-name"
            />
            <button className="settings__save-btn" onClick={handleNameSave}>{t('settings.save', 'Save')}</button>
          </div>
        </div>
        <div className="settings__field">
          <label className="settings__label">{t('settings.units', 'Units')}</label>
          <select
            className="settings__select"
            value={user.preferences.units}
            onChange={(e) => updatePreferences({ units: e.target.value })}
            id="settings-units"
          >
            <option value="metric">{t('settings.unit.metric', 'Metric (kg, km)')}</option>
            <option value="imperial">{t('settings.unit.imperial', 'Imperial (lb, mi)')}</option>
          </select>
        </div>
      </GlassCard>

      {/* Data management */}
      <GlassCard className="settings__card" delay={0.1}>
        <h3 className="settings__card-title">{t('settings.data_management', 'Data Management')}</h3>
        <div className="settings__actions">
          <button className="settings__action-btn" onClick={handleExport} id="export-data-btn">
            <Download size={18} />
            <div>
              <span className="settings__action-title">{t('settings.export_data', 'Export Data')}</span>
              <span className="settings__action-desc">{t('settings.export_desc', 'Download your data as JSON backup')}</span>
            </div>
          </button>

          <label className="settings__action-btn" htmlFor="import-file" id="import-data-btn">
            <Upload size={18} aria-hidden="true" />
            <div>
              <span className="settings__action-title">{t('settings.import_data', 'Import Data')}</span>
              <span className="settings__action-desc">{t('settings.import_desc', 'Restore from a backup file')}</span>
            </div>
            <input
              type="file"
              id="import-file"
              accept=".json"
              onChange={handleImport}
              aria-label={t('settings.import_data', 'Import Data')}
              style={{ display: 'none' }}
            />
          </label>

          <button
            className="settings__action-btn settings__action-btn--danger"
            onClick={() => setShowResetConfirm(true)}
            id="reset-data-btn"
          >
            <Trash2 size={18} />
            <div>
              <span className="settings__action-title">{t('settings.reset_data', 'Reset All Data')}</span>
              <span className="settings__action-desc">{t('settings.reset_desc', 'Clear everything and start fresh')}</span>
            </div>
          </button>
        </div>

        {showResetConfirm && (
          <motion.div
            className="settings__confirm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>{t('settings.confirm_reset', '⚠️ This will permanently delete all your data. Are you sure?')}</p>
            <div className="settings__confirm-actions">
              <button className="settings__confirm-cancel" onClick={() => setShowResetConfirm(false)}>{t('settings.cancel', 'Cancel')}</button>
              <button className="settings__confirm-delete" onClick={handleReset} id="confirm-reset-btn">{t('settings.confirm_btn', 'Yes, Reset Everything')}</button>
            </div>
          </motion.div>
        )}
      </GlassCard>

      {/* About */}
      <GlassCard className="settings__card" delay={0.15}>
        <h3 className="settings__card-title">{t('settings.about', 'About')}</h3>
        <div className="settings__about">
          <Info size={16} />
          <div>
            <p><strong>{t('brand.name', 'EcoMirror AI')}</strong> {t('settings.version', 'v1.0.0')}</p>
            <p className="settings__about-text">
              {t('settings.about_desc', 'Mirror your lifestyle, see its ecological reflection. Built for a sustainable future. 🌍')}
            </p>
            <p className="settings__about-text">
              {t('settings.about_storage', 'All data is stored locally on your device. No data is sent to any server.')}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
