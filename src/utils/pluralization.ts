const EnPluralRules = new Intl.PluralRules('en-US');

export const pluralize = (
  count: number,
  singleValue: string,
  pluralValue: string,
) => {
  const category = EnPluralRules.select(count);

  switch (category) {
    case 'one':
      return singleValue;

    case 'other':
      return pluralValue;

    default:
      throw new Error(`Unsupported pluralization category "${category}"`);
  }
};
