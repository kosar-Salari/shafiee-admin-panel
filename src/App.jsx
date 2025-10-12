import React from 'react';
import { Admin, Resource } from 'react-admin';
import dataProvider from './dataProvider';
import { PostList } from './post'; // کامپوننتی که برای نمایش لیست پست‌ها می‌سازید

function App() {
  return (
    <Admin dataProvider={dataProvider}>
      <Resource name="posts" list={PostList} />
      {/* منابع دیگر مانند "users", "products" می‌توانید اضافه کنید */}
    </Admin>
  );
}

export default App;
