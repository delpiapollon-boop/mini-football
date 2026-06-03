#!/bin/bash
cd backend
npm install
npm run migrate
npm start &
cd ../frontend
npm install
npm start