import React, { useState, forwardRef, useRef } from 'react';
import { useUncontrolled, useDidUpdate, useMergedRef, useUuid } from '@mantine/hooks';
import {
  DefaultProps,
  MantineSize,
  MantineShadow,
  ClassNames,
  useExtractedMargins,
} from '@mantine/styles';
import {
  InputWrapper,
  InputWrapperBaseProps,
  InputWrapperStylesNames,
} from '../InputWrapper/InputWrapper';
import { Input, InputBaseProps, InputStylesNames } from '../Input/Input';
import { MantineTransition } from '../Transition';
import { SelectDropdown, SelectDropdownStylesNames } from '../Select/SelectDropdown/SelectDropdown';
import { SelectItems } from '../Select/SelectItems/SelectItems';
import { DefaultItem } from '../Select/DefaultItem/DefaultItem';
import { filterData } from './filter-data/filter-data';
import useStyles from './Autocomplete.styles';

export type AutocompleteStylesNames =
  | InputStylesNames
  | InputWrapperStylesNames
  | SelectDropdownStylesNames
  | ClassNames<typeof useStyles>;

export interface AutocompleteItem {
  value: string;
  [key: string]: any;
}

export interface AutocompleteProps
  extends DefaultProps<AutocompleteStylesNames>,
    InputBaseProps,
    InputWrapperBaseProps,
    Omit<React.ComponentPropsWithoutRef<'input'>, 'size' | 'onChange'> {
  /** Input size */
  size?: MantineSize;

  /** Autocomplete data used to renderer items in dropdown */
  data: (string | AutocompleteItem)[];

  /** Change item renderer */
  itemComponent?: React.FC<any>;

  /** Dropdown shadow from theme or any value to set box-shadow */
  shadow?: MantineShadow;

  /** Limit amount of items rendered in dropdown */
  limit?: number;

  /** Called when item from dropdown was selected */
  onItemSubmit?(item: AutocompleteItem): void;

  /** Controlled input value */
  value?: string;

  /** Uncontrolled input defaultValue */
  defaultValue?: string;

  /** Controlled input onChange handler */
  onChange?(value: string): void;

  /** Dropdown body appear/disappear transition */
  transition?: MantineTransition;

  /** Dropdown body transition duration */
  transitionDuration?: number;

  /** Dropdown body transition timing function, defaults to theme.transitionTimingFunction */
  transitionTimingFunction?: string;

  /** Initial dropdown opened state */
  initiallyOpened?: boolean;

  /** Function based on which items in dropdown are filtered */
  filter?(value: string, item: AutocompleteItem): boolean;

  /** Message that will be displayed on zero search results  */
  nothingFound?: string;

  /** Called when dropdown is opened */
  onDropdownOpen?(): void;

  /** Called when dropdown is closed */
  onDropdownClose?(): void;

  /** Dropdown z-index */
  zIndex?: number;
}

export function defaultFilter(value: string, item: AutocompleteItem) {
  return item.value.toLowerCase().trim().includes(value.toLowerCase().trim());
}

export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      className,
      style,
      sx,
      required = false,
      label,
      id,
      error,
      description,
      size = 'sm',
      shadow = 'sm',
      data,
      limit = 5,
      value,
      defaultValue,
      onChange,
      itemComponent = DefaultItem,
      onItemSubmit,
      onKeyDown,
      onFocus,
      onBlur,
      onClick,
      transition = 'skew-up',
      transitionDuration = 0,
      initiallyOpened = false,
      transitionTimingFunction,
      wrapperProps,
      classNames,
      styles,
      filter = defaultFilter,
      nothingFound,
      onDropdownClose,
      onDropdownOpen,
      zIndex,
      ...others
    }: AutocompleteProps,
    ref
  ) => {
    const { classes } = useStyles({ size }, { classNames, styles, name: 'Autocomplete' });
    const { mergedStyles, rest } = useExtractedMargins({ others, style });
    const [dropdownOpened, _setDropdownOpened] = useState(initiallyOpened);
    const [hovered, setHovered] = useState(-1);
    const [direction, setDirection] = useState<React.CSSProperties['flexDirection']>('column');

    const inputRef = useRef<HTMLInputElement>(null);
    const uuid = useUuid(id);
    const [_value, handleChange] = useUncontrolled({
      value,
      defaultValue,
      finalValue: '',
      onChange,
      rule: (val) => typeof val === 'string',
    });

    const setDropdownOpened = (opened: boolean) => {
      _setDropdownOpened(opened);
      const handler = opened ? onDropdownOpen : onDropdownClose;
      typeof handler === 'function' && handler();
    };

    useDidUpdate(() => {
      setHovered(0);
    }, [_value]);

    const handleItemClick = (item: AutocompleteItem) => {
      handleChange(item.value);
      typeof onItemSubmit === 'function' && onItemSubmit(item);
      setTimeout(() => setDropdownOpened(false));
    };

    const formattedData = data.map((item) => (typeof item === 'string' ? { value: item } : item));
    const filteredData = filterData({ data: formattedData, value: _value, limit, filter });

    const handleInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      typeof onKeyDown === 'function' && onKeyDown(event);

      const isColumn = direction === 'column';

      const handleNext = () => {
        setHovered((current) => (current < filteredData.length - 1 ? current + 1 : current));
      };

      const handlePrevious = () => {
        setHovered((current) => (current > 0 ? current - 1 : current));
      };

      switch (event.nativeEvent.code) {
        case 'ArrowUp': {
          event.preventDefault();

          isColumn ? handlePrevious() : handleNext();
          break;
        }

        case 'ArrowDown': {
          event.preventDefault();

          isColumn ? handleNext() : handlePrevious();
          break;
        }

        case 'Enter': {
          if (filteredData[hovered] && dropdownOpened) {
            event.preventDefault();
            handleChange(filteredData[hovered].value);
            typeof onItemSubmit === 'function' && onItemSubmit(filteredData[hovered]);
            setDropdownOpened(false);
          }
          break;
        }

        case 'Escape': {
          if (dropdownOpened) {
            event.preventDefault();
            setDropdownOpened(false);
          }
        }
      }
    };

    const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      typeof onFocus === 'function' && onFocus(event);
    };

    const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      typeof onBlur === 'function' && onBlur(event);
      setDropdownOpened(false);
    };

    const handleInputClick = (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
      typeof onClick === 'function' && onClick(event);
      setDropdownOpened(!dropdownOpened);
    };

    const shouldRenderDropdown =
      dropdownOpened && (filteredData.length > 0 || (filteredData.length === 0 && !!nothingFound));

    return (
      <InputWrapper
        required={required}
        id={uuid}
        label={label}
        error={error}
        description={description}
        size={size}
        className={className}
        classNames={classNames}
        styles={styles}
        style={mergedStyles}
        __staticSelector="Autocomplete"
        sx={sx}
        {...wrapperProps}
      >
        <div
          className={classes.wrapper}
          role="combobox"
          aria-haspopup="listbox"
          aria-owns={`${uuid}-items`}
          aria-controls={uuid}
          aria-expanded={shouldRenderDropdown}
          onMouseLeave={() => setHovered(-1)}
          tabIndex={-1}
        >
          <Input<'input'>
            {...rest}
            data-mantine-stop-propagation={dropdownOpened}
            required={required}
            ref={useMergedRef(ref, inputRef)}
            id={uuid}
            type="string"
            invalid={!!error}
            size={size}
            onKeyDown={handleInputKeydown}
            classNames={classNames}
            styles={styles}
            __staticSelector="Autocomplete"
            value={_value}
            onChange={(event) => {
              handleChange(event.currentTarget.value);
              setDropdownOpened(true);
            }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onClick={handleInputClick}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={shouldRenderDropdown ? `${uuid}-items` : null}
            aria-activedescendant={hovered !== -1 ? `${uuid}-${hovered}` : null}
          />

          <SelectDropdown
            mounted={shouldRenderDropdown}
            transition={transition}
            transitionDuration={transitionDuration}
            transitionTimingFunction={transitionTimingFunction}
            uuid={uuid}
            shadow={shadow}
            maxDropdownHeight="auto"
            classNames={classNames}
            styles={styles}
            __staticSelector="Autocomplete"
            direction={direction}
            onDirectionChange={setDirection}
            referenceElement={inputRef.current}
            zIndex={zIndex}
          >
            <SelectItems
              data={filteredData}
              hovered={hovered}
              classNames={classNames}
              styles={styles}
              uuid={uuid}
              __staticSelector="Autocomplete"
              onItemHover={setHovered}
              onItemSelect={handleItemClick}
              itemComponent={itemComponent}
              size={size}
              nothingFound={nothingFound}
            />
          </SelectDropdown>
        </div>
      </InputWrapper>
    );
  }
);

Autocomplete.displayName = '@mantine/core/Autocomplete';
