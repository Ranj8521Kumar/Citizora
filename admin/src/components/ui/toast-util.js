import { toast as showToast } from "./toast-utils.jsx";

export const toast = ({ title, description, action, ...props }) => {
  showToast({
    title,
    description,
    action,
    ...props
  });
};
