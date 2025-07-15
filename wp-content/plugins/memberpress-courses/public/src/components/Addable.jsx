import Spinner from "../components/Spinner";
import classNames from "classnames";

import { useEffect, useRef } from '@wordpress/element';

const Addable = ({
  className,
  icon,
  placeholder,
  value,
  handleChange,
  handleSubmit,
  isLoading
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.focus();
    }
  }, [ref, isLoading]);

  return (
    <div className={classNames('mpcs-addable', className)}>
      {icon}
      <input
        type="text"
        ref={ref}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder}
        disabled={isLoading}
      />
      {isLoading && <Spinner />}
    </div>
  );
};
export default Addable;
