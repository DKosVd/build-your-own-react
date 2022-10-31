const createElement = (type, props, ...children) => {
    return {
        type,
        props: {
            ...props,
            children: children.map( child => typeof child === 'object' ?  child : createTextElement(child))
        }
    }
}

const createTextElement = (text) => {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

//https://habr.com/ru/company/timeweb/blog/587908/ Про idleCallback 

function render(element, container) {
    console.log(element)
    const dom = element.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type);
    const isProperty = key => key !== "children";

    Object.keys(element.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = element.props[name]
        })

    element.props.children.forEach( child => render(child, dom)
    )

    container.appendChild(dom);
}

let nextUnitOfWork = null;

function workLoop(deadline) {
    console.log(deadline.timeRemaining())
    let shouldYield = false;
    while(nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = perfomUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    requestIdleCallback(workLoop);
}

// requestIdleCallback(workLoop)

function perfomUnitOfWork(nextUnitOfWork) {

}

const Didact = {
    createElement,
    render
}


/** @jsx Didact.createElement */
// const elementJSX = (
//     <div id="foo">
//       <a>bar</a>
//       <b />
//     </div>
// )

const container = document.getElementById("root")
const element = Didact.createElement('div', null, createElement('h2', null, 'Some text'))
Didact.render(element, container)