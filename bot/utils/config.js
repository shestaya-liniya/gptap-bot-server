
class Config {
  constructor() {
    if (Config.instance) {
      return Config.instance;
    }
    this.invoiceCanBeCreated = true;
    this.invoiceId = 0
    Config.instance = this;
  }

  getInvoiceCanBeCreated() {
    return this.invoiceCanBeCreated;
  }

  setInvoiceId (newData) {
    this.invoiceId  = newData;
  }

  getInvoiceId () {
    return this.invoiceId ;
  }

  setInvoiceCanBeCreated(newData) {
    this.invoiceCanBeCreated = newData;
  }
}

export default new Config()

