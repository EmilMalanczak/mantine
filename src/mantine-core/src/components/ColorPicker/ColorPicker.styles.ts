import { createMemoStyles, getSizeValue, MantineSize, MantineTheme } from '../../theme';

interface ColorPickerStyles {
  theme: MantineTheme;
  size: MantineSize;
}

export const sizes = {
  xs: 180,
  sm: 200,
  md: 240,
  lg: 280,
  xl: 320,
};

export default createMemoStyles({
  root: ({ size }: ColorPickerStyles) => ({
    width: getSizeValue({ size, sizes }),
  }),

  body: ({ theme }: ColorPickerStyles) => ({
    display: 'flex',
    paddingTop: theme.spacing.sm,
  }),

  sliders: ({ theme }: ColorPickerStyles) => ({
    flex: 1,

    '&:not(:only-child)': {
      marginRight: theme.spacing.xs,
    },
  }),

  slider: {
    '& + &': {
      marginTop: 5,
    },
  },

  swatch: {
    cursor: 'pointer',
  },
});
