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

function createDom(fiber) {
    const dom = fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);

    const isProperty = key => key !== "children";

    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = fiber.props[name]
        })

    return dom;
}

function commitRoot() {
    commitWork(wipRoot.child);
    wipRoot = null;
}

function commitWork(fiber) {
    if(!fiber) return;
    const domParent = fiber.parent.dom;
    domParent.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling)
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        }
    }
    nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let wipRoot = null;

function workLoop(deadline) {
    let shouldYield = false;
    while(nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = perfomUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    if(!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
}

// requestIdleCallback(workLoop)

function perfomUnitOfWork(fiber) {
    if(!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    if(fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }

    const elements = fiber.props.children;
    let index = 0;
    let prevSibling = null;

    while(index <= elements.length) {
        const element = elements[index];

        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null
        }

        if(index === 0) {
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
        index++;
    
        if(fiber.child) {
            return fiber.child;
        }
    
        let nextFiber = fiber;
        while(nextFiber) {
            if(nextFiber.sibling) {
                return nextFiber.sibling;
            }
            nextFiber = nextFiber.parent
        }
    }

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