export const formDataToJPO = (formData) => {
  if (formData instanceof FormData === false) return formData;

  return Array.from(formData.entries()).reduce((res, [key, value]) => {
    return { ...res, [key]: value };
  }, {});
};

export const objectToMap = (object) => {
  return new Map(Object.entries(object ?? {}));
};

export const mapToObject = (map) => {
  return Object.fromEntries(map);
};

export const filename = (string) => {
  if (string) {
    return string.split('/').slice(-1)[0].match(/([^?]+)/g)?.[0] ?? string;
  }
};
