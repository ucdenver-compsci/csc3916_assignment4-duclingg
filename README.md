# Assignment Four
## Purpose
The purpose of this assignment is to leverage Google’s analytics policies to gather information about the requests being sent in by users.

Using the information already entered to MongoDB for the previous assignment, you will add another collection of reviews that are tied to the movies. This way users can query the database and get the previous information (title, year released and actors) as well as the reviews. These two entities should remain separate! Do not append the reviews to the existing movie information.  

Leverage the Async.js library or mongo $lookup aggregation capability to join the entities.

## Installation and Usage
1. Run `npm install` in program directory
2. Deploy program on Render
3. Run `npm run start` in program directory or Launch Program via VS Code debug

## Postman Link
[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/32473950-eea83745-3279-4ce8-9bf3-9c5ae41b19d3?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D32473950-eea83745-3279-4ce8-9bf3-9c5ae41b19d3%26entityType%3Dcollection%26workspaceId%3D0b48c0b9-f609-4bd9-8b7a-7c46300b22e9#?env%5BCSCI3916_HW4%5D=W3sia2V5IjoiSldUIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlLCJ0eXBlIjoiZGVmYXVsdCIsInNlc3Npb25WYWx1ZSI6IkpXVC4uLiIsInNlc3Npb25JbmRleCI6MH1d)