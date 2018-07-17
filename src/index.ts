import { CreateElement } from './lib/std/type';
import { ReactLite } from './lib/std/reactlite';
import {
  button,
  div,
  h1,
  p,
  input,
  table,
  td,
  th,
  tr,
} from './lib/std/dom.util';

interface ITodoData {
  id: string;
  time: string;
  content: string;
  onRemoved?: () => void;
}

class App extends ReactLite<any, any> {
  constructor(prop: any = {}) {
    super(prop);

    this.state = {
      todo: '',
      // todos: Array.from({ length: 1000 }).map(_ => ({
      //   id: Math.floor(Math.random() * 1000000),
      //   time: 'wow',
      //   content: this.state.todo
      // }))

      todos: [
        { id: 'a', time: '09:00', content: 'Get up' },
        { id: 'b', time: '12:00', content: 'Eat Luanch' },
        { id: 'c', time: '15:00', content: 'Study' },
        { id: 'd', time: '20:00', content: 'Sleep' },
      ]
    };
  }

  private onInputChanged(e: KeyboardEvent) {
    this.setState({
      todo: (e.target as HTMLInputElement).value
    });
  }

  private add() {
    this.setState({
      todo: '',
      todos: this.state.todos.concat({
        id: Math.floor(Math.random() * 1000000),
        time: 'wow',
        content: this.state.todo
      })
    });
  }

  private remove(index: number) {
    const todos = [...this.state.todos];
    todos.splice(index, 1);

    this.setState({
      todos
    });
  }

  private renderTitle() {
    return h1(null, 'TODOs');
  }

  public render(h: CreateElement) {
    return div(null,
      this.renderTitle(),
      input({
        domAttr: {
          value: this.state.todo
        },
        on: {
          input: (e: KeyboardEvent) => this.onInputChanged(e)
        }
      }),
      button(
        {
          on: {
            click: () => this.add()
          }
        },
        'add'
      ),
      h(TodoList, null,
        ...this.state.todos.map((todo: ITodoData, index: number) =>
          h(Todo,
            {
              key: todo.id,
              ...todo,
              onRemoved: () => this.remove(index)
            }
          )
        )
      ),
    );
  }
}

class TodoList extends ReactLite {
  public render(h: CreateElement) {
    return div(
      {
        class: ['wow'],
        style: {
          border: '1px solid grey',
          padding: '8px',
        }
      },
      ...this.childNodes
    );
  }
}

class Todo extends ReactLite<any, ITodoData> {
  constructor(prop: ITodoData) {
    super(prop);

    this.state = {
      mark: false,
      like: 0,
    };
  }

  public delete() {
    this.prop.onRemoved && this.prop.onRemoved();
  }

  public switch() {
    this.setState({
      mark: !this.state.mark
    });
  }

  public like() {
    this.setState({
      like: this.state.like + 1
    });
  }

  public render(h: CreateElement) {
    return div(
      {
        domAttr: {
          id: this.prop.id,
        },
        style: 'display: flex;',
      },
      p(null, this.state.like),
      p(null, `${this.state.mark ? '[TODO]' : '[----]'}`),
      p(null, `${this.prop.time} - ${this.prop.content}`),
      button(
        {
          on: {
            click: () => this.switch()
          }
        },
        this.state.mark ? 'Nope' : 'Go!'
      ),
      button(
        {
          on: {
            click: () => this.delete()
          }
        },
        'remove'
      ),
      button(
        {
          on: {
            click: () => this.like()
          }
        },
        'like'
      ),
    );
  }
}

const global: any = window;
global.foo = ReactLite.mount('#app', h => h(App, null));
console.log(global.foo.context);
