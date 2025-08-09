// Create a simple utility function for showing toasts
export function showToast({ title, message, type = 'info', duration = 3000 }) {
  // Check if toast container exists
  let toastContainer = document.getElementById('toast-container');
  
  // Create toast container if it doesn't exist
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '1000';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.style.minWidth = '250px';
  toast.style.margin = '0 0 10px 0';
  toast.style.padding = '15px';
  toast.style.borderRadius = '4px';
  toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  toast.style.display = 'flex';
  toast.style.justifyContent = 'space-between';
  toast.style.alignItems = 'center';
  toast.style.animation = 'fadeIn 0.5s';
  toast.style.transition = 'all 0.5s ease-in-out';
  
  // Set background color based on toast type
  switch (type) {
    case 'success':
      toast.style.backgroundColor = '#def7ec';
      toast.style.borderLeft = '4px solid #31c48d';
      toast.style.color = '#046c4e';
      break;
    case 'error':
      toast.style.backgroundColor = '#fde2e2';
      toast.style.borderLeft = '4px solid #f98080';
      toast.style.color = '#c81e1e';
      break;
    case 'warning':
      toast.style.backgroundColor = '#feecdc';
      toast.style.borderLeft = '4px solid #ff8a4c';
      toast.style.color = '#9a3412';
      break;
    default:
      toast.style.backgroundColor = '#e1effe';
      toast.style.borderLeft = '4px solid #3f83f8';
      toast.style.color = '#1e429f';
  }
  
  // Create content wrapper
  const contentWrapper = document.createElement('div');
  
  // Add title if provided
  if (title) {
    const titleElement = document.createElement('div');
    titleElement.textContent = title;
    titleElement.style.fontWeight = 'bold';
    titleElement.style.marginBottom = '5px';
    contentWrapper.appendChild(titleElement);
  }
  
  // Add message
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  contentWrapper.appendChild(messageElement);
  
  // Add content to toast
  toast.appendChild(contentWrapper);
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.background = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '20px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.marginLeft = '10px';
  closeButton.style.color = 'inherit';
  closeButton.onclick = () => {
    removeToast(toast);
  };
  toast.appendChild(closeButton);
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Auto-remove toast after duration
  setTimeout(() => {
    removeToast(toast);
  }, duration);
  
  // Add CSS animation
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-20px); }
    }
  `;
  document.head.appendChild(style);
  
  // Function to remove toast
  function removeToast(toastElement) {
    toastElement.style.animation = 'fadeOut 0.5s forwards';
    setTimeout(() => {
      if (toastContainer.contains(toastElement)) {
        toastContainer.removeChild(toastElement);
      }
      
      // Remove container if empty
      if (toastContainer.childElementCount === 0) {
        document.body.removeChild(toastContainer);
      }
    }, 500);
  }
}
