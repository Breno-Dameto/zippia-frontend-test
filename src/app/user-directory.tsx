'use client';

import { useState, useEffect, type SetStateAction } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  address: {
    city: string;
  };
  company: {
    name: string;
  };
}

type SortColumn = 'name' | 'username' | 'email' | 'phone' | 'address.city' | 'company.name';

export default function UserDirectory() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError('An error occurred while fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: SortColumn) => {
    const order = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(order);

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const aValue = getValueByPath(a, column);
      const bValue = getValueByPath(b, column);
      return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * (order === 'asc' ? 1 : -1);
    });
    setFilteredUsers(sortedUsers);
  };

  const getValueByPath = (user: User, path: SortColumn) => {
    const [mainKey, subKey] = path.split('.') as [keyof User, string | undefined];
    if (subKey) {
      const nestedObject = user[mainKey] as { [key: string]: any };
      return nestedObject[subKey];
    } else {
      return user[mainKey];
    }
  };

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">User Directory</h1>
      <div className="d-flex mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e: { target: { value: SetStateAction<string> } }) => setSearchTerm(e.target.value)}
          className="form-control me-2"
        />
        <button className="btn btn-dark" onClick={fetchUsers} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Fetch Users'}
        </button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th scope="col" onClick={() => handleSort('name')}>Name</th>
            <th scope="col" onClick={() => handleSort('username')}>Username</th>
            <th scope="col" onClick={() => handleSort('email')}>Email</th>
            <th scope="col" onClick={() => handleSort('phone')}>Phone</th>
            <th scope="col" onClick={() => handleSort('address.city')}>City</th>
            <th scope="col" onClick={() => handleSort('company.name')}>Company</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.address.city}</td>
              <td>{user.company.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
