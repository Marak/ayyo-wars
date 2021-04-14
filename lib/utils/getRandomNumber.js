module.exports = function getRandomNumber(min, max) {
  // TODO: replace with mersenne twister
  return Math.random() * (max - min) + min;
}
