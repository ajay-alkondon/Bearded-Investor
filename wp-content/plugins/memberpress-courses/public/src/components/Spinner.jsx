import { Fragment } from '@wordpress/element';

const Spinner = () => {
  return (
    <Fragment>
      <div className="loader">
        <img src={MPCS_Course_Data.imagesUrl + "/square-loader.gif"} />
      </div>
    </Fragment>
  );
};

export default Spinner;
