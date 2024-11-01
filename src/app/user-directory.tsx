'use client'

import { useState, useEffect, type SetStateAction } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  id: number
  name: string
  username: string
  email: string
  phone: string
  address: {
    city: string
  }
  company: {
    name: string
  }
}

type SortColumn = 'name' | 'username' | 'email' | 'phone' | 'address.city' | 'company.name'

export default function UserDirectory() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
    } catch (err) {
      setError('An error occurred while fetching users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (column: SortColumn) => {
    const order = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortColumn(column)
    setSortOrder(order)

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const aValue = getValueByPath(a, column)
      const bValue = getValueByPath(b, column)
      return (
        (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) *
        (order === 'asc' ? 1 : -1)
      )
    })
    setFilteredUsers(sortedUsers)
  }

  const getValueByPath = (user: User, path: SortColumn) => {
    const [mainKey, subKey] = path.split('.') as [keyof User, string | undefined]
  
    if (subKey) {
      // Acessa a propriedade aninhada, como address.city ou company.name
      const nestedObject = user[mainKey] as { [key: string]: any }
      return nestedObject[subKey]
    } else {
      // Acessa diretamente propriedades não aninhadas, como name, username, etc.
      return user[mainKey]
    }
  }

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Directory</h1>
      <div className="mb-4 flex space-x-2">
        <Input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e: { target: { value: SetStateAction<string> } }) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={fetchUsers} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Fetch Users'}
        </Button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Table>
        <TableCaption>A list of users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('name')}>Name</TableHead>
            <TableHead onClick={() => handleSort('username')}>Username</TableHead>
            <TableHead onClick={() => handleSort('email')}>Email</TableHead>
            <TableHead onClick={() => handleSort('phone')}>Phone</TableHead>
            <TableHead onClick={() => handleSort('address.city')}>City</TableHead>
            <TableHead onClick={() => handleSort('company.name')}>Company</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.address.city}</TableCell>
              <TableCell>{user.company.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
