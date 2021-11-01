import React, { useState, useRef, forwardRef } from 'react';
import { useUncontrolled, useMergedRef, upperFirst } from '@mantine/hooks';
import dayjs from 'dayjs';
import { Calendar, CalendarSettings } from '../Calendar/Calendar';
import { DatePickerBase, DatePickerBaseSharedProps } from '../DatePickerBase/DatePickerBase';

export interface DatePickerProps extends DatePickerBaseSharedProps, Omit<CalendarSettings, 'size'> {
  /** Selected date, required with controlled input */
  value?: Date;

  /** Called when date changes */
  // onChange?(value: Date | null): void;
  onChange?: any;

  /** Default value for uncontrolled input */
  defaultValue?: Date | null;

  /** Set to false to force dropdown to stay open after date was selected */
  closeCalendarOnChange?: boolean;

  /** dayjs input format */
  inputFormat?: string;

  /** Control initial dropdown opened state */
  initiallyOpened?: boolean;
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      defaultValue,
      classNames,
      styles,
      shadow = 'sm',
      locale = 'en',
      inputFormat = 'MMMM D, YYYY',
      transitionDuration = 200,
      transitionTimingFunction,
      nextMonthLabel,
      previousMonthLabel,
      closeCalendarOnChange = true,
      labelFormat = 'MMMM YYYY',
      withSelect = false,
      yearsRange,
      dayClassName,
      dayStyle,
      disableOutsideEvents,
      minDate,
      maxDate,
      excludeDate,
      initialMonth,
      initiallyOpened = false,
      name = 'date',
      size = 'sm',
      dropdownType = 'popover',
      clearable = true,
      disabled = false,
      clearButtonLabel,
      fixOnBlur = true,
      allowManualTyping,
      ...others
    }: DatePickerProps,
    ref
  ) => {
    const [dropdownOpened, setDropdownOpened] = useState(initiallyOpened);
    const calendarSize = size === 'lg' || size === 'xl' ? 'md' : 'sm';
    const inputRef = useRef<HTMLInputElement>();

    const [lastValidValue, setLastValidValue] = useState(defaultValue ?? null);
    const [_value, setValue] = useUncontrolled({
      value,
      defaultValue,
      finalValue: null,
      onChange,
      rule: (val) => val === null || val instanceof Date,
    });

    const closeDropdown = () => {
      setDropdownOpened(false);
      setTimeout(() => inputRef.current?.focus(), transitionDuration + 20);
    };

    const handleValueChange = (date: Date) => {
      setValue(date);

      setLastValidValue(date);
      closeCalendarOnChange && closeDropdown();
    };

    const handleClear = () => {
      setValue(null);
      setLastValidValue(null);
      inputRef.current?.focus();
    };

    const handleInputBlur = () => {
      // @ts-expect-error - https://github.com/iamkun/dayjs/issues/320
      const isInputValid = _value === dayjs(_value, inputFormat).format(inputFormat);

      if (isInputValid) {
        const date = dayjs(_value).toDate();

        setValue(date);
        setLastValidValue(date);
      } else if (fixOnBlur) {
        setValue(lastValidValue);
      }
    };

    const handleChange = (e) => {
      setValue(e.target.value);
    };

    return (
      <DatePickerBase
        allowManualTyping={allowManualTyping}
        dropdownOpened={dropdownOpened}
        setDropdownOpened={setDropdownOpened}
        shadow={shadow}
        transitionDuration={transitionDuration}
        ref={useMergedRef(ref, inputRef)}
        size={size}
        styles={styles}
        classNames={classNames}
        onChange={handleChange}
        onBlur={handleInputBlur}
        name={name}
        inputLabel={
          _value instanceof Date
            ? upperFirst(dayjs(_value).locale(locale).format(inputFormat))
            : _value ?? ''
        }
        __staticSelector="date-picker"
        dropdownType={dropdownType}
        clearable={clearable && !!_value && !disabled}
        clearButtonLabel={clearButtonLabel}
        onClear={handleClear}
        disabled={disabled}
        {...others}
      >
        <Calendar
          classNames={classNames}
          styles={styles}
          locale={locale}
          nextMonthLabel={nextMonthLabel}
          previousMonthLabel={previousMonthLabel}
          initialMonth={_value instanceof Date ? _value : initialMonth}
          value={_value instanceof Date ? _value : dayjs(_value).toDate()}
          onChange={handleValueChange}
          labelFormat={labelFormat}
          withSelect={withSelect}
          yearsRange={yearsRange}
          dayClassName={dayClassName}
          dayStyle={dayStyle}
          disableOutsideEvents={disableOutsideEvents}
          minDate={minDate}
          maxDate={maxDate}
          excludeDate={excludeDate}
          __staticSelector="date-picker"
          fullWidth={dropdownType === 'modal'}
          size={dropdownType === 'modal' ? 'lg' : calendarSize}
        />
      </DatePickerBase>
    );
  }
);

DatePicker.displayName = '@mantine/dates/DatePicker';
