export function toast({ title, description, ...props }) {
  const id = Math.random().toString(36).substring(2, 9);
  
  // Create toast element
  const toastContainer = document.createElement('div');
  toastContainer.id = `toast-${id}`;
  toastContainer.className = 'fixed top-4 right-4 z-50 max-w-xs bg-white rounded-lg shadow-lg p-4 border border-gray-200';
  
  // Add title
  if (title) {
    const titleEl = document.createElement('h3');
    titleEl.className = 'text-sm font-medium text-gray-900';
    titleEl.textContent = title;
    toastContainer.appendChild(titleEl);
  }
  
  // Add description
  if (description) {
    const descEl = document.createElement('p');
    descEl.className = 'mt-1 text-sm text-gray-500';
    descEl.textContent = description;
    toastContainer.appendChild(descEl);
  }
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'absolute top-2 right-2 text-gray-400 hover:text-gray-500';
  closeBtn.innerHTML = '×';
  closeBtn.onclick = () => {
    toastContainer.classList.add('fade-out');
    setTimeout(() => toastContainer.remove(), 300);
  };
  toastContainer.appendChild(closeBtn);
  
  // Apply variant styling
  if (props.variant === 'destructive') {
    toastContainer.className = 'fixed top-4 right-4 z-50 max-w-xs bg-red-50 border-red-200 rounded-lg shadow-lg p-4 border';
  } else if (props.variant === 'success') {
    toastContainer.className = 'fixed top-4 right-4 z-50 max-w-xs bg-green-50 border-green-200 rounded-lg shadow-lg p-4 border';
  }
  
  // Add fade-in animation
  toastContainer.style.opacity = '0';
  toastContainer.style.transition = 'opacity 0.3s ease-in-out';
  
  // Add to document
  document.body.appendChild(toastContainer);
  
  // Trigger animation
  setTimeout(() => {
    toastContainer.style.opacity = '1';
  }, 10);
  
  // Auto-remove after duration
  setTimeout(() => {
    toastContainer.classList.add('fade-out');
    toastContainer.style.opacity = '0';
    setTimeout(() => toastContainer.remove(), 300);
  }, props.duration || 5000);
  
  // Add fade-out animation style
  const style = document.createElement('style');
  style.textContent = `
    .fade-out {
      opacity: 0 !important;
      transition: opacity 0.3s ease-in-out !important;
    }
  `;
  document.head.appendChild(style);
  
  return {
    id,
    dismiss: () => {
      toastContainer.classList.add('fade-out');
      setTimeout(() => toastContainer.remove(), 300);
    },
  };
}
