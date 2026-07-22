export type MenuItem = {
  name: string;
  description?: string;
  price?: string;
  tags?: string[];
};

export type MenuSection = {
  id: string;
  title: string;
  note?: string;
  items: MenuItem[];
};

export const foodMenu: MenuSection[] = [
  {
    id: "antipasti",
    title: "Antipasti",
    items: [
      { name: "Focaccia Toscana", description: "Tuscan style focaccia — crisp and thin", price: "6" },
      { name: "Olives", description: "Mixed California olives in citrus infused olive oil", price: "8" },
      {
        name: "Prosciutto e Burrata",
        description: "Prosciutto di Parma aged 18 months, fresh burrata cheese & arugula. Served with warm focaccia",
        price: "20",
      },
      {
        name: "Calamari Fritti",
        description: "Fresh squid fried and tossed with spices, served with our signature aioli",
        price: "19",
      },
      {
        name: "Polpo Olive e Patate",
        description: "Seared Spanish octopus, marble potatoes, cherry tomatoes, taggiasca olives, rosemary, garlic",
        price: "24.5",
      },
    ],
  },
  {
    id: "insalate",
    title: "Insalate · Contorni",
    items: [
      { name: "Zuppa del Giorno", description: "Soup of the day — Piccolo / Grande", price: "11 / 15" },
      {
        name: "Insalata Sozzani",
        description: "Baby spinach, gorgonzola dolce, dried cranberries, pistachios & pears tossed in a balsamic vinaigrette",
        price: "15",
      },
      { name: "French Fries", description: "Truffle or cacio e pepe", price: "11" },
      { name: "Veggie of the Day", description: "Inquire with your server", price: "12" },
      { name: "Salad Special", description: "Inquire with your server", price: "15" },
    ],
  },
  {
    id: "pasta",
    title: "Pasta",
    note: "Our dry pasta is house made with organic American grains. Our fresh pasta is house made with non-GMO American grains. Ask your server about our vegan & gluten free pasta options.",
    items: [
      {
        name: "Tagliatelle Ragù Bianco",
        description: "Fettucine-like noodles tossed with a creamy pork and chicken ragù, mushrooms, parmigiano",
        price: "23",
      },
      {
        name: "Lasagna",
        description: "Beef and pork ragù, layered in a béchamel-tomato-meat sauce, parmigiano",
        price: "24",
      },
      {
        name: "Gnocchi Cacio e Pepe",
        description: "Soft & fluffy potato gnocchi with a black pepper and pecorino & parmigiano cheese sauce",
        price: "24",
      },
      {
        name: "Pappardelle Salmone",
        description: "Succulent salmon and wide ribbons of pappardelle pasta in a creamy sauce with a hint of lemon zest",
        price: "26",
      },
      { name: "Pasta Specials", description: "Inquire with your server", price: "AQ" },
    ],
  },
  {
    id: "secondi",
    title: "Secondi",
    items: [
      {
        name: "Eggplant Parmigiana",
        description: "Thinly sliced pan-fried eggplant, basil, parmigiano, tomato sauce",
        price: "23",
      },
      { name: "Pesce del Giorno", description: "Monterey Fish Market catch of the day. Inquire with your server", price: "38" },
    ],
  },
  {
    id: "pizze",
    title: "Pizze",
    note: "Our regular 12\" pizzas are made on organic house made dough. Substitute gluten free or cornmeal crust.",
    items: [
      { name: "Cannavaro", description: "Tomato sauce, mozzarella, basil", price: "19" },
      {
        name: "Margherita Classica",
        description: "San Marzano tomato sauce, fresh fior di latte mozzarella, fresh basil",
        price: "23",
      },
      {
        name: "Giardino",
        description: "Tomato sauce, mozzarella, grilled summer squash, sun dried tomatoes, ricotta, arugula",
        price: "23",
      },
      {
        name: "Basso",
        description: "Tomato sauce, mozzarella, artichoke hearts, sun dried tomatoes, castelvetrano olives, basil pesto",
        price: "24",
      },
      { name: "Bellucci", description: "Tomato sauce, mozzarella, fennel sausage, fresh ricotta", price: "24" },
      { name: "Diavola – Materazzi", description: "Tomato sauce, mozzarella, calabrese salami, kalamata olives", price: "24" },
      {
        name: "Fiori",
        description: "Tomato sauce, mozzarella, mushrooms, arugula, prosciutto parma, truffle oil",
        price: "25",
      },
      { name: "Stella", description: "Mozzarella, crescenza cheese, prosciutto parma, seasonal mushrooms", price: "25" },
      {
        name: "Jovanotti",
        description: "Tomato sauce, mozzarella, calabrese salami, prosciutto cotto, smoked mozzarella, mushrooms",
        price: "26",
      },
      { name: "Magnini", description: "Mozzarella, mascarpone cheese, smoked salmon, garnished with dill", price: "26" },
      { name: "Murino", description: "Mozzarella, gorgonzola cheese, pears, drizzled honey", price: "24" },
      {
        name: "Gattuso",
        description: "Butternut squash puree, fior di latte mozzarella, parsley, sage oil, ricotta salata",
        price: "24",
      },
      {
        name: "Bortolami",
        description: "Tomato sauce, mozzarella, hot Italian sausage, mushrooms, radicchio treviso, smoked mozzarella",
        price: "24",
      },
      {
        name: "Citterio",
        description: "Mozzarella, baby spinach, prosciutto cotto, fior di latte mozzarella, grana padano",
        price: "24",
      },
      {
        name: "Casalengo",
        description: "Mozzarella, crescenza cheese, pancetta, yukon gold potatoes, rosemary oil",
        price: "24",
      },
    ],
  },
  {
    id: "calzoni",
    title: "Calzoni",
    note: "Vegetarian; can be made vegan with non-dairy mozzarella/ricotta cheeses & meat substitutes. Pesto contains dairy and will be omitted from vegan options.",
    items: [
      {
        name: "Ricotta & Spinachi",
        description: "Mozzarella, fresh ricotta, sautéed spinach, topped with tomato sauce",
        price: "22",
      },
      { name: "Bellucci", description: "Mozzarella, fresh ricotta, fennel sausage, topped with tomato sauce", price: "24" },
    ],
  },
  {
    id: "dolci",
    title: "Dolci",
    items: [
      { name: "Tiramisu", description: "Ladyfingers, espresso, mascarpone", price: "12.5" },
      { name: "Crème Brûlée", description: "Traditional crème brûlée", price: "12.5" },
      { name: "Cannoli Siciliani", description: "Ricotta filled cannoli, side of house made gelato", price: "12.5" },
      { name: "Gelato", description: "One, two, or three scoops. Daily selection", price: "5 / 8 / 11" },
      { name: "Affogato", description: "Espresso served over choice of gelato", price: "11" },
      {
        name: "Zucchero",
        description: "Calzone-shaped dough with chocolate hazelnut filling, topped with seasonal berries (serves 3–4)",
        price: "16",
      },
      {
        name: "Ricotta & Pistachio Cake",
        description: "Ricotta and pistachio creams separated by sponge cake, crushed pistachios, powdered sugar",
        price: "11",
      },
      { name: "Soufflé al Cioccolato", description: "Moist chocolate cake with a heart of creamy rich chocolate", price: "12.5" },
      {
        name: "Chocolate Temptation",
        description: "Ecuadorian cocoa infused chocolate cake, hazelnut cremes & crunch, chocolate glaze",
        price: "11",
      },
      { name: "Dark Chocolate Profiteroles", description: "Cream puffs filled with Chantilly cream, enrobed in chocolate", price: "11" },
      {
        name: "Torta della Nonna",
        description: "Lemon infused pastry cream on shortcrust pastry, pine nuts, almonds, powdered sugar",
        price: "11",
      },
      {
        name: "Black Forest Cake (Selva Nera)",
        description: "Chocolate sponge layers, cherry compote, whipped cream, chocolate shavings",
        price: "12.5",
      },
    ],
  },
];

export const drinksMenu: MenuSection[] = [
  {
    id: "bevande",
    title: "Bevande",
    items: [
      { name: "Coke, Diet Coke, Sprite", description: "12fl oz can", price: "5" },
      { name: "Molecola", description: "Italian cola", price: "5.5" },
      { name: "Italian Soda", description: "Blood orange, lemon, orange, grapefruit", price: "5.5" },
      { name: "Acqua Panna", description: "750ml natural spring water", price: "7.5" },
      { name: "San Pellegrino Sparkling Water", description: "750ml bottle", price: "7.5" },
      { name: "Iced Tea", price: "3" },
      { name: "Hot Tea", description: "Ask your server for selections", price: "4" },
      { name: "Orange Juice", price: "4" },
    ],
  },
  {
    id: "birre",
    title: "Italian Beer Selection",
    items: [
      { name: "Dolomiti Pilsner", description: "Italian Pilsner", price: "10" },
      { name: "Dolomiti Rossa", description: "Double Malt · Veneto", price: "10" },
      { name: "Menabrea Ambrata", description: "Märzen-Style Amber · Lombardia", price: "10" },
      { name: "Mastri Birrai Blonde", description: "Italian Blonde Ale", price: "10" },
      { name: "Mastri Birrai Pilsner", description: "Italian Pilsner", price: "10" },
      { name: "Mastri Birrai IPA", description: "Italian Pale Ale", price: "10" },
      { name: "Baladin Isaac", description: "Yellow blanche beer, slightly hazy IPA", price: "10" },
      { name: "Baladin Nora", description: "Spiced Ale · Piemonte", price: "10" },
      { name: "Baladin Nazionale", description: "Citrus Italian Blonde Ale", price: "10" },
      { name: "Baladin L'IPA", description: "Citrus Italian IPA", price: "10" },
      { name: "Alternative 0.0", description: "Alcohol free beer · Trentino", price: "10" },
    ],
  },
  {
    id: "sparkling",
    title: "Sparkling",
    items: [
      { name: "Aperol Spritz", description: "Prosecco, Aperol, dehydrated citrus", price: "15 (5oz)" },
      { name: "Vermut Spritz", description: "Prosecco, Vermut, dehydrated citrus", price: "15 (5oz)" },
      { name: "Lemoncello Spritz", description: "Prosecco, Limoncello, dehydrated citrus", price: "15 (5oz)" },
      { name: "Mimosa", description: "Prosecco, orange juice", price: "15 (5oz)" },
      { name: "Prosecco Brut", description: "La Gioiosa · 2023 Veneto", price: "50 (bottle)" },
      { name: "Prosecco Alcohol Free", description: "Sensazioni · 0.0% · 750ml", price: "49" },
      { name: "Moscato di Asti", description: "Pimonte · 2022 · 375ml", price: "26" },
    ],
  },
  {
    id: "bianchi",
    title: "Bianchi / White",
    items: [
      { name: "Pinot Grigio", description: "Cantina Lavis · 2023 Trentino", price: "49" },
      { name: "Sauvignon Blanc", description: "St Paul · 2023 Trentino", price: "52" },
      { name: "Rosé di Primitivo", description: "San Marzano · 2023 Puglia", price: "49" },
      { name: "Chardonnay", description: "Bravium · 2024 Russian River Valley", price: "49" },
      { name: "Cinque Terre Bianco", description: "Coop Cinque Terre · 2023 Liguria", price: "45" },
      { name: "Edda", description: "San Marzano · 2022 Puglia", price: "52" },
      { name: "Pinot Grigio Alcohol Free", description: "Sensazioni · Trentino", price: "48" },
      { name: "Pecorino", description: "Abruzzo · 2020 Marche", price: "49" },
      { name: "Gavi", description: "Villa Sparina · 2020 Piemonte", price: "49" },
      { name: "Fiano di Avelino", description: "Cantine Mastroberadino · 2023 Campania", price: "48" },
    ],
  },
  {
    id: "rossi",
    title: "Rossi / Red",
    items: [
      { name: "Pinot Nero", description: "St. Pauls · 2023 Alto Adige", price: "49" },
      { name: "Chianti Classico", description: "Basilica Caffaggio · 2022 Toscana", price: "49" },
      { name: "Primitivo", description: "San Marzano · 2022 Puglia", price: "49" },
      { name: "Barbera d'Asti", description: "Pico Maccario · 2022 Piemonte", price: "55" },
      { name: "Cabernet Sauvignon — Educated Guess", description: "North Coast · 2022 Napa Valley", price: "49" },
      { name: "Brachetto Icardi", description: "Pimonte · 2021 · 375ml", price: "26" },
      { name: "Valpolicella", description: "Nicolis · 2020 Veneto", price: "48" },
      { name: "Lambrusco", description: "Villa di Corlo · 2020 Emilia-Romagna", price: "48" },
      { name: "Rossese di Dolceacqua", description: "Maixei · 2023 Liguria", price: "50" },
      { name: "Etna Rosso", description: "Passione Theresa Eccher · 2020 Sicilia", price: "78" },
      { name: "Cabernet Sauvignon", description: "Caterwaul · 2023 Sonoma County", price: "85" },
      { name: "Barolo Montezemolo", description: "Cordero Di Montezemolo · Monfalletto 2018", price: "110" },
      { name: "Brunello di Montalcino", description: "Casanova di Neri · 2020 Tuscany", price: "145" },
      { name: "Brunello di Montalcino", description: "Pian Delle Vigne · Toscana", price: "165" },
    ],
  },
  {
    id: "mocktails",
    title: "Mocktails",
    items: [
      { name: "Phony Mezcal Negroni", description: "Smoky Negroni-inspired mocktail. Bold with mezcal-inspired botanicals", price: "14" },
      { name: "Phony Negroni", description: "Classic Negroni-inspired mocktail. Balanced bittersweet with citrus notes", price: "14" },
    ],
  },
];
