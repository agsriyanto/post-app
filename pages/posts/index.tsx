import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { List, Spin, Pagination, Modal, Button, message, Input, Form } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import withAuth from '@/hoc/withAuth';

type Post = {
  id: number;
  title: string;
  body: string;
};

const fetchPosts = async (page: number, perPage: number, token: string): Promise<Post[]> => {
  const response = await axiosInstance.get(`/posts`, {
    params: {
      'access-token': token,
      page,
      per_page: perPage,
    },
  });
  return response.data;
};

const createPost = async (token: string, data: { user_id: number; title: string; body: string }) => {
  const response = await axiosInstance.post(`/posts`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const updatePost = async (id: number, token: string, data: { title: string; body: string }) => {
  await axiosInstance.put(`/posts/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

const deletePost = async (id: number, token: string) => {
  await axiosInstance.delete(`/posts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const Posts = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    const name = sessionStorage.getItem('name');
    const accessToken = sessionStorage.getItem('access_token');
    const userId = sessionStorage.getItem('user_id');
    setName(name || '');
    setToken(accessToken || '');
    setUserId(userId ? Number(userId) : null);
  }, []);

  const { data, isLoading, isError, error, refetch } = useQuery<Post[]>({
    queryKey: ['posts', currentPage, perPage],
    queryFn: () => fetchPosts(currentPage, perPage, token),
    enabled: !!token,
  });

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPerPage(pageSize);
    }
    refetch();
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setSelectedPost(null);
    setIsModalVisible(false);
  };

  const handleCreatePost = async () => {
    try {
      const values = await createForm.validateFields();
      const postData = {
        user_id: userId,
        title: values.title,
        body: values.body,
      }
      await createPost(token as string, postData);
      message.success('Post created successfully');
      setIsCreateModalVisible(false);
      createForm.resetFields();
      refetch();
    } catch (err) {
      message.error('Failed to create the post. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setEditingPostId(null);
  };

  const handleEdit = (post: Post) => {
    setEditingPostId(post.id);
    editForm.setFieldsValue({ title: post.title, body: post.body });
  };

  const handleEditSave = async (id: number) => {
    try {
      const values = await editForm.validateFields();
      await updatePost(id, token as string, values);
      message.success('Post updated successfully');
      setEditingPostId(null);
      refetch();
    } catch (err) {
      message.error('Failed to update the post. Please try again.');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this post?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deletePost(id, token as string);
          message.success('Post deleted successfully');
          refetch();
        } catch (err) {
          message.error('Failed to delete the post. Please try again.');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-center text-red-500">Error: {(error as Error).message}</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Hi {name}!</h1>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold mb-4">List Post</h3>
        <Button type="primary" className="mb-4" onClick={() => setIsCreateModalVisible(true)}>
          Add New Post
        </Button>
      </div>
      <List
        bordered
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            {editingPostId === item.id ? (
              <Form form={editForm} layout="inline" className="w-full flex items-center justify-between flex-nowrap gap-4">
                <div className="flex flex-col w-full gap-2">
                  <Form.Item
                    name="title"
                    rules={[{ required: true, message: 'Please enter the title' }]}
                    className="w-2/3"
                  >
                    <Input placeholder="Title" />
                  </Form.Item>
                  <Form.Item
                    name="body"
                    rules={[{ required: true, message: 'Please enter the body' }]}
                    className="w-full"
                  >
                    <Input.TextArea placeholder="Body" rows={3} />
                  </Form.Item>
                </div>
                <div className="flex gap-3">
                  <Button
                    icon={<CheckOutlined />}
                    type="primary"
                    onClick={() => handleEditSave(item.id)}
                  />
                  <Button icon={<CloseOutlined />} onClick={handleEditCancel} />
                </div>
              </Form>
            ) : (
              <div className="flex justify-between items-center w-full gap-4">
                <div onClick={() => handlePostClick(item)} className="cursor-pointer hover:bg-gray-100 hover:rounded-md p-4 w-full">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p>{item.body}</p>
                </div>
                <div className="flex gap-4">
                  <EditOutlined
                    style={{ fontSize: '18px', color: 'blue' }}
                    onClick={() => handleEdit(item)}
                  />
                  <DeleteOutlined
                    style={{ fontSize: '18px', color: 'red' }}
                    onClick={() => handleDelete(item.id)}
                  />
                </div>
              </div>
            )}
          </List.Item>
        )}
      />
      <Pagination
        className="!mt-4 text-center justify-end"
        current={currentPage}
        pageSize={perPage}
        total={100}
        onChange={handlePageChange}
        showSizeChanger
        pageSizeOptions={['5', '10', '20', '50']}
      />

      <Modal
        title="Post Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
      >
        {selectedPost && (
          <div>
            <h3 className="font-bold">{selectedPost.title}</h3>
            <p>{selectedPost.body}</p>
            <p className="text-sm mt-3">Post ID: {selectedPost.id}</p>
          </div>
        )}
      </Modal>

      <Modal
        title="Create New Post"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCreateModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="create" type="primary" onClick={handleCreatePost}>
            Create
          </Button>,
        ]}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter the title' }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>
          <Form.Item
            name="body"
            label="Body"
            rules={[{ required: true, message: 'Please enter the body' }]}
          >
            <Input.TextArea placeholder="Enter body" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default withAuth(Posts);