export default function mergeRefs<T>(...refs: any[]) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(value);
      else if (ref != null) ref.current = value;
    });
  };
}
