import {
  ReactFiber,
  mount,
} from './lib/fiber/react';
import {
  createElement as h
} from './lib/fiber/element';
import {
  h1,
  input,
  button,
  p,
  span,
} from './lib/fiber/dom.util';

class App extends ReactFiber {
  constructor(prop: any = {}) {
    super(prop);

    this.state = {
      todo: '',
      todos: [
        { id: 'a', time: '09:00', content: 'Get up' },
        { id: 'b', time: '12:00', content: 'Eat Luanch' },
        { id: 'c', time: '15:00', content: 'Study' },
        { id: 'd', time: '20:00', content: 'Sleep' },
      ]
    };
  }

  private onInputChanged(e: KeyboardEvent) {
    this.setState(state =>
      Object.assign({}, state, {
        todo: (e.target as HTMLInputElement).value
      })
    );
  }

  private add() {
    this.setState(state =>
      Object.assign({}, state, {
        todo: '',
        todos: state.todos.concat({
          id: Math.floor(Math.random() * 1000000),
          time: 'wow',
          content: state.todo
        })
      })
    );
  }

  private remove(index: number) {
    this.setState(state => {
      const todos = [...state.todos];
      todos.splice(index, 1);

      return Object.assign({}, state, { todos })
    });
  }

  public render() {
    return [
      h1(null,
        'TODOs'
      ),
      input(
        {
          domAttr: {
            value: this.state.todo
          },
          on: {
            input: (e: KeyboardEvent) => this.onInputChanged(e)
          }
        },
      ),
      button(
        {
          on: {
            click: () => this.add()
          }
        },
        'add'
      ),
      ...this.state.todos.map((todo: any, index: number) =>
        p(null,
          span(null, todo.time),
          span(null, todo.content),
          button(
            {
              on: {
                click: () => this.remove(index)
              }
            },
            'remove'
          )
        )
      )
    ];
  }
}

mount('#app', h(App, null));
