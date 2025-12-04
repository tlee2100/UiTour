let externalSetIsLoading = null;

export function registerSetIsLoading(fn) {
  externalSetIsLoading = fn;
}

export function setIsLoadingGlobal(value) {
  if (externalSetIsLoading) externalSetIsLoading(value);
}
