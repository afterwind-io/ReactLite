import { CreateElement } from './lib/type';
import { ReactLite } from './lib/reactlite';
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
} from './lib/dom.util';

interface ITodoData {
  time: string;
  content: string;
  onRemoved?: () => void;
}

class App extends ReactLite<any, ITodoData> {
  constructor(prop: any = {}) {
    super(prop);

    this.state = {
      todo: '',
      todos: [
        { time: '09:00', content: 'Get up' },
        { time: '12:00', content: 'Eat Luanch' },
        { time: '15:00', content: 'Study' },
        { time: '20:00', content: 'Sleep' },
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

  public render(h: CreateElement) {
    return div(null,
      h1(null, 'TODOs'),
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
      ...this.state.todos.map((todo: ITodoData, index: number) =>
        h(Todo,
          {
            ...todo,
            onRemoved: () => this.remove(index)
          }
        )
      )
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
    return div({ style: 'display: flex;' },
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
