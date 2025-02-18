export const debounce = (callback: () => void, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback();
    }, delay);
  };
};
