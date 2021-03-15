import config from '../config.json'

export function getFilesByParent (id) {
  return uni.request({
    url: config.remote,
    data: {
      currentFolderId: id
    },
    method: 'POST'
  })
}
