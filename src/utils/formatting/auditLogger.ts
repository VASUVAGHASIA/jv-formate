
import { AuditEntry } from '../../types/formatting';

const AUDIT_STORAGE_KEY = 'word_addin_format_audit_log';

export const logFormatOperation = (entry: AuditEntry): void => {
    try {
        const history = getAuditHistory();
        history.unshift(entry); // Add to beginning

        // Keep last 50 entries
        if (history.length > 50) {
            history.length = 50;
        }

        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Failed to save audit log:', error);
    }
};

export const getAuditHistory = (): AuditEntry[] => {
    try {
        const json = localStorage.getItem(AUDIT_STORAGE_KEY);
        if (!json) return [];

        return JSON.parse(json, (key, value) => {
            if (key === 'timestamp') return new Date(value);
            return value;
        }) as AuditEntry[];
    } catch (error) {
        console.error('Failed to load audit log:', error);
        return [];
    }
};

export const clearAuditHistory = (): void => {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
};
