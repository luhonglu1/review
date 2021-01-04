/**
 * @param {*} deep 深度
 * @param {*} breadth 广度
 * @return {*}
 */
function createData(deep, breadth) {
  var data = {}
  var temp = data
  for (var i = 0; i < deep; i++) {
    temp = temp['data'] = {}
    for (var j = 0; j < breadth; j++) {
      temp[j] = j
    }
  }

  return data
}
exports.createData = createData
