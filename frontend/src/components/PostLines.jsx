export default function PostLines({ lines }) {
    const linesArray = []
  
    let link = null
    lines.forEach((line, index) => {
      switch (line) { 
        case 0: link = '/assets/images/line-none.png'; break
        case 1: link = '/assets/images/line-line.png'; break
        case 2: link = '/assets/images/line-branch.png'; break
        case 3: link = '/assets/images/line-last.png'; break
        default: link = null
      }
      if (link) linesArray.push(
        <img src={ link } className="post-lines" key = {`${index}`} />
      )
    })
  
    return linesArray
  }
  