export default function toTitleCase(str) {
  return str.replace(/[^-'\s]+/g, function (word) {
    return word.replace(/^./, function (first) {
      return first.toUpperCase();
    });
  });
}
