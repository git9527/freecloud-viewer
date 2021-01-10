import config from '../config.json'

export function getFilesByParent (parent) {
  return uni.request({
    url: config.remote,
    data: {
      parent: parent
    },
    method: 'POST'
  })
}
