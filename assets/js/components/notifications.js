/**
 * ⚡️ UnifyX Bill Maker - Notification Components
 * Toast notifications and alert system
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class NotificationComponents {
    constructor() {
        this.notifications = new Map();
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        
        this.initializeContainer();
        
        console.log('🔔 NotificationComponents initialized');
    }

    /**
     * Initialize notification container
     */
    initializeContainer() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container top-right';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Show notification
     */
    showNotification(type, title, message, options = {}) {
        const {
            duration = this.defaultDuration,
            closable = true,
            persistent = false,
            actions = []
        } = options;

        const id = this.generateId();
        
        const notification = {
            id,
            type,
            title,
            message,
            duration,
            closable,
            persistent,
            actions,
            createdAt: Date.now()
        };

        this.notifications.set(id, notification);
        
        const element = this.createNotificationElement(notification);
        this.container.appendChild(element);
        
        // Animate in
        setTimeout(() => element.classList.add('show'), 10);
        
        // Auto remove if not persistent
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.removeNotification(id);
            }, duration);
        }

        // Limit notifications
        this.limitNotifications();
        
        return id;
    }

    /**
     * Create notification element
     */
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `toast toast-${notification.type}`;
        element.id = `toast-${notification.id}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        let actionsHtml = '';
        if (notification.actions.length > 0) {
            actionsHtml = `
                <div class="toast-actions">
                    ${notification.actions.map(action => `
                        <button class="toast-action-btn" onclick="${action.onClick}">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        element.innerHTML = `
            <div class="toast-icon">${icons[notification.type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${notification.title}</div>
                <div class="toast-message">${notification.message}</div>
                ${actionsHtml}
            </div>
            ${notification.closable ? `
                <button class="toast-close" onclick="window.NotificationComponents.removeNotification('${notification.id}')">
                    ×
                </button>
            ` : ''}
        `;

        return element;
    }

    /**
     * Remove notification
     */
    removeNotification(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        const element = document.getElementById(`toast-${id}`);
        if (element) {
            element.classList.add('removing');
            setTimeout(() => {
                element.remove();
                this.notifications.delete(id);
            }, 300);
        }
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        this.notifications.forEach((_, id) => {
            this.removeNotification(id);
        });
    }

    /**
     * Limit number of notifications
     */
    limitNotifications() {
        const notificationArray = Array.from(this.notifications.values());
        if (notificationArray.length > this.maxNotifications) {
            const oldest = notificationArray
                .sort((a, b) => a.createdAt - b.createdAt)[0];
            this.removeNotification(oldest.id);
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    // Convenience methods
    showSuccess(title, message, options = {}) {
        return this.showNotification('success', title, message, options);
    }

    showError(title, message, options = {}) {
        return this.showNotification('error', title, message, options);
    }

    showWarning(title, message, options = {}) {
        return this.showNotification('warning', title, message, options);
    }

    showInfo(title, message, options = {}) {
        return this.showNotification('info', title, message, options);
    }
}

window.NotificationComponents = new NotificationComponents();
