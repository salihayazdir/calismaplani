export default function toTitleCase(str) {
  return str
    .toLocaleLowerCase('tr-TR')
    .replace(/(?:^|\s|,|;|!|:|-|\.|\?)[a-z0-9ğçşüöı]/g, function (match) {
      return match.toLocaleUpperCase('tr-TR');
    });
}
