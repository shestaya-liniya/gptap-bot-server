
class Config {
  constructor() {
    if (Config.instance) {
      return Config.instance;
    }
    this.invoiceCanBeCreated = true;
    Config.instance = this;
  }

  getInvoiceCanBeCreated() {
    return this.invoiceCanBeCreated;
  }

  setInvoiceCanBeCreated(newData) {
    this.invoiceCanBeCreated = newData;
  }
}

export default new Config()

