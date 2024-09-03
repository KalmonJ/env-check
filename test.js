
const node = {
  name: "jhon",
  childrens: [{ name: "james", childrens: [{ name: "jane", childrens: [] }] }]
}


function recursiveValidation(node, name, equal) {
  console.log(node.name, name)

  if (node.name === name) {
    equal = true
    return equal
  }

  if (!node.childrens.length) return equal = false

  node.childrens.forEach(child => {
    equal = recursiveValidation(child, name, equal)
  })

  console.log("chegou aqui")
  return equal
}


console.log(recursiveValidation(node, "jane", false))