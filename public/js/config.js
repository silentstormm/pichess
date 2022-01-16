;(function (exports) {
  exports.MAX_ALLOWED_GUESSES = 10 /* Maximum number of guesses */
  exports.MIN_WORD_LENGTH = 5 /* Minimum allowed word length */
  exports.MAX_WORD_LENGTH = 15 /* Maximum allowed word length */
  exports.WEBSOCKET_URL = 'ws://localhost:3000' /* WebSocket URL */
  exports.HIDDEN_CHAR = 'ꙮ' /* Hidden char of the UI */ // it's hidden because it isn't used lol
})(typeof exports === 'undefined' ? (this.Config = {}) : exports)
