import { useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

function useCollapsible() {
  const containerRef = useRef(null);
  const [isCollapse, setCollapse] = useState(false);
  const show = isCollapse ? 'show' : '';

  useOnClickOutside(containerRef, () => setCollapse(false));

  const toggle = () => setCollapse((prev) => !prev);

  return { containerRef, show, isCollapse, toggle };
}

export default useCollapsible;
