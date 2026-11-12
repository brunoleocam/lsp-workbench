/** Mede etapas de uma operação e registra só quando o total passa de `slowMs`. */
export class PerfTrace {
  private readonly start: number;
  private last: number;
  private readonly steps: string[] = [];

  constructor(
    private readonly label: string,
    private readonly sink: (message: string) => void,
    private readonly now: () => number = () => performance.now(),
    private readonly slowMs = 300
  ) {
    this.start = this.now();
    this.last = this.start;
  }

  step(name: string): void {
    const t = this.now();
    this.steps.push(`${name}=${Math.round(t - this.last)}ms`);
    this.last = t;
  }

  end(): void {
    const t = this.now();
    const total = t - this.start;
    if (total < this.slowMs) return;
    const steps = [...this.steps, `resto=${Math.round(t - this.last)}ms`];
    this.sink(`${this.label} ${Math.round(total)}ms (${steps.join(", ")})`);
  }
}
