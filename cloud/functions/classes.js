class ParsePost extends Parse.Object {
  constructor() { super('Posts') }

  get content()   { return this.get('content')}
  get authorObj() { return this.get('author')}
  get author()    { return this.get('author').get('username')}
  get avatar()    { return this.get('author').get('avatar')?.url() ?? DEFAULT_AVATAR}
  get comments()  { return this.get('comments') ?? []}
  get parent()    { return this.get('parentPost')}
  get createdAt() { return this.get('createdAt')}

  set content(content)      { this.set('content', content)}
  set authorObj(authorObj)  { this.set('author', authorObj)}
  set comments(comments)    { this.set('comments', comments)}
  set parent(parent)        { this.set('parentPost', parent)}

  unsiftComments(comment)     { this.comments.unshift(comment); this.set('comments', this.comments)}
  removeFromComments(comment) { this.set('comments', this.comments.filter(c => c != comment))}
}
Parse.Object.registerSubclass('Posts', ParsePost)

module.exports = ParsePost