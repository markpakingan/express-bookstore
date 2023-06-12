process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("../db");
const app = require("../app"); 

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const BCRYPT_WORK_FACTOR =1;
const Book = requre("..models/books");

let testBooks;

beforeEach(async ()=>{
    let result = await db.query(`
    INSERT INTO books (isbn, amazon_url, author, language, pages, publisher,
        title, year) VALUES("12312312312", "wwww.amazon.com/pokemon",
        "mark lee", 100, "Jose Rizal Publications", "The Wizard of Oz",
        1992) RETURNING isbn`);

    testBooks = result.rows[0].isbn
})


describe("GET /books", function () {
    test("Gets a list of 1 book", async function () {
      const response = await request(app).get(`/books`);
      const books = response.body.books;
      expect(books).toHaveLength(1);
      expect(books[0]).toHaveProperty("isbn");
      expect(books[0]).toHaveProperty("amazon_url");
    });
  });


describe("GET /books:isbn", function(){
    test("Get a book based on ID", async ()=>{
        const response = await request(app).get(`/books/${testBooks}`)
    
        expect (response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(testBooks);
    })

})
  
describe("POST /books", ()=>{
    test("Post another book", async ()=>{
        const response = await request(app).post("/books").send(
            {
            isbn: '12312312312',
            amazon_url: "www.amazon.com/pokemon",
            author: "mark lee",
            language: "english",
            pages: 100,
            publisher: "Jose Rizal Publication",
            title: "amazing times",
            year: 2023
            });
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty(testBooks);        
    })
})

describe("PUT /books:isbn", ()=>{
    test("Update info on specific book", async()=>{
        const response = await request(app).put(`/books/${testBooks}`).send(
            {
            amazon_url: "www.amazon.com/pokemon",
            author: "Another User",
            language: "english",
            pages: 100,
            publisher: "Jose Rizal Publication",
            title: "amazing times",
            year: 2023
            });
        
        expect(response.statusCode).toBe(200);
        expect(response.body.book.author).toBe("UPDATED BOOK");

    })
})

describe("DELETE /books:isbn", ()=>{
    test("Delete a single book", async()=>{
        const response = await request(app).delete(`/books/${testBooks}`)
    });

    expect (response.body).toBe({message: "Book Deleted"})
})

afterAll(async function () {
    await db.end()
  });
  

//   this is a test