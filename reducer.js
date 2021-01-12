//reducer.js
const initialState = {
  count: 0,
}

exports.reducer = function (state = initialState, action) {
  switch (action.type) {
    case 'plus':
      return {
        ...state,
        count: state.count + 1,
      }
    case 'subtract':
      return {
        ...state,
        count: state.count - 1,
      }
    default:
      return initialState
  }
}
