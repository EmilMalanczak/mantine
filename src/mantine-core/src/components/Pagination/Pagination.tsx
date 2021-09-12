import React from 'react';
import cx from 'clsx';
import { usePagination } from '@mantine/hooks';
import { DefaultProps, mergeStyles, useMantineTheme } from '../../theme';
import useStyles from './Pagination.styles';
import { DefaultItem, PaginationItemProps } from './DefaultItem/DefaultItem';

export type { PaginationItemProps } from './DefaultItem/DefaultItem';

export type PaginationStylesNames = keyof ReturnType<typeof useStyles>;

export interface PaginationProps extends DefaultProps<PaginationStylesNames> {
  /** Change item component  */
  itemComponent?: React.FC<PaginationItemProps>

  /** Button color from theme */
  color?: string;

  /** Page selected on initial render */
  initialPage?: number;

  /** Controlled active page number */
  page?: number;

  /** Total amount of pages */
  total: number;

  /** Siblings amount on left/right side of selected page */
  siblings?: number;

  /** Amount of elements visible on left/right edges */
  boundary?: number;

  /** Callback fired after change of each page */
  onChange?: (page: number) => void;

  /** Callback to control aria-labels */
  getItemAriaLabel?: (page: number | 'dots' | 'prev' | 'next') => string | undefined;
}

export function Pagination({
  itemComponent: Item = DefaultItem,
  className,
  classNames,
  style,
  styles,
  themeOverride,
  page,
  initialPage = 1,
  color,
  total,
  siblings = 1,
  boundary = 1,
  onChange,
  getItemAriaLabel,
  ...others
}: PaginationProps) {
  const theme = useMantineTheme(themeOverride);
  const classes = useStyles(
    { theme, color },
    classNames,
    'pagination'
  );
  const _styles = mergeStyles(classes, styles);

  const {
    paginationRange,
    goToPage,
    goNextPage,
    goPrevPage,
    activePage,
  } = usePagination({
    page,
    siblings,
    total,
    onChange,
    initialPage,
    boundary,
  });

  return (
    <nav className={cx(classes.root, className)} style={{ ...style, ..._styles.root }} {...others}>
      <Item
        page="prev"
        onClick={goPrevPage}
        aria-label={getItemAriaLabel ? getItemAriaLabel('prev') : undefined}
        aria-disabled={activePage === 1}
        style={{
          ..._styles.item,
          ...(activePage === 1 ? _styles.disabled : undefined),
         }}
        className={cx(classes.item, {
          [classes.disabled]: activePage === 1,
        })}
        disabled={activePage === 1 || undefined}
      />
      {paginationRange.map((pageNumber, index) => (
        <Item
          key={`${pageNumber}${index}`}
          page={pageNumber}
          active={pageNumber === activePage || undefined}
          aria-label={getItemAriaLabel ? getItemAriaLabel(pageNumber) : undefined}
          style={{
            ..._styles.item,
            ...(pageNumber === activePage ? _styles.active : undefined),
            ...(pageNumber === 'dots' ? _styles.dots : undefined),
          }}
          className={cx(classes.item, {
            [classes.active]: pageNumber === activePage,
            [classes.dots]: pageNumber === 'dots',
          })}
          onClick={pageNumber !== 'dots' ? () => goToPage(pageNumber) : undefined}
        />
      ))}
       <Item
         page="next"
         onClick={goNextPage}
         aria-label={getItemAriaLabel ? getItemAriaLabel('next') : undefined}
         aria-disabled={activePage === total}
         style={{
          ..._styles.item,
          ...(activePage === total ? _styles.disabled : undefined),
         }}
         className={cx(classes.item, {
           [classes.disabled]: activePage === total,
          })}
         disabled={activePage === total || undefined}
       />
    </nav>
  );
}

Pagination.displayName = '@mantine/core/Pagination';
