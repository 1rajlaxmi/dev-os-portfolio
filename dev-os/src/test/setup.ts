import '@testing-library/jest-dom';

// jsdom does not implement scrollIntoView — mock it globally so Terminal tests pass
window.HTMLElement.prototype.scrollIntoView = () => {};
