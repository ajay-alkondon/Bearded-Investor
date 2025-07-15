import icons from "../lib/icons";

import { Icon } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Pagination = ({ paged, maxPage, handlePaginate }) => {
  const [isNextPage, setNextPage] = useState(false);
  const [isPrevPage, setPrevPage] = useState(false);

  const nextPage = parseInt(paged, 10) + 1;
  const prevPage = parseInt(paged, 10) - 1;

  useEffect(() => {
    if (nextPage <= maxPage) {
      setNextPage(true);
    } else {
      setNextPage(false);
    }

    if (paged > 1) {
      setPrevPage(true);
    } else {
      setPrevPage(false);
    }
  }, [paged, maxPage]);

  return (
    <div className="mpcs-lessons-pagination" data-paged={ paged }>
      {isPrevPage && (
        <a id="mpcs-nav-prev" href="#0" onClick={(e) => handlePaginate(e, prevPage)}>
          <Icon icon={icons.arrowPrev} size="14" />
          <span>{__("Prev", "memberpress-courses")}</span>

        </a>
      )}

      {isNextPage && (
        <a id="mpcs-nav-next" href="#0" onClick={(e) => handlePaginate(e, nextPage)}>
          <span>{__("Next", "memberpress-courses")}</span>
          <Icon icon={icons.arrowNext} size="14" />
        </a>
      )}
    </div>
  );
};

export default Pagination;
