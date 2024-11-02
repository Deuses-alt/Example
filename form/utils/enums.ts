export enum Tag {
  Mistress = 0,
  Slave = 1,
  Submissive = 2,
}

export enum DepartureType {
  Flats = 0,
  Hotels = 1,
  Saunas = 2,
  Offices = 3,
  OutOfTown = 4,
}

export enum Departure {
  None = 0,
  IncludedInPrice = 1,
  ClientPays = 2,
}

export enum Sort {
  score = 'score',
  new = 'new',
  price = 'price',
  priceDesc = 'priceDesc',
}
