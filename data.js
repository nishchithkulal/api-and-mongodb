//data.js
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useState, useEffect } from 'react';

const API_URL = 'http://192.168.1.4:3000';

export default function DataScreen() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Edit modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState({ id: null, name: '', phoneNumber: '' });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/list`);
      const data = await response.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching members:', error);
      Alert.alert('Error', 'Could not load members');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (item) => {
    Alert.alert(
      'Confirm delete',
      `Delete ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item._id) },
      ],
      { cancelable: true }
    );
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const res = await fetch(`${API_URL}/api/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchMembers();
      } else {
        console.error('Delete failed:', data);
        Alert.alert('Error', data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Network error while deleting:', error);
      Alert.alert('Error', 'Network error while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (item) => {
    setEditingMember({ id: item._id, name: item.name || '', phoneNumber: item.phoneNumber || '' });
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    const { id, name, phoneNumber } = editingMember;
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert('Validation', 'Name and phone number are required');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: name.trim(), phoneNumber: phoneNumber.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setModalVisible(false);
        fetchMembers();
      } else {
        console.error('Edit failed:', data);
        Alert.alert('Error', data.error || 'Edit failed');
      }
    } catch (error) {
      console.error('Network error while editing:', error);
      Alert.alert('Error', 'Network error while editing');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>Name: {item.name}</Text>
        <Text style={styles.memberPhone}>Phone: {item.phoneNumber}</Text>
      </View>

      <View style={styles.buttonsColumn}>
        <TouchableOpacity style={styles.editButton} onPress={() => openEdit(item)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item)}
          disabled={deletingId === item._id}
        >
          {deletingId === item._id ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={members}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        refreshing={loading}
        onRefresh={fetchMembers}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Member</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editingMember.name}
              onChangeText={(t) => setEditingMember((p) => ({ ...p, name: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              value={editingMember.phoneNumber}
              keyboardType="phone-pad"
              onChangeText={(t) => setEditingMember((p) => ({ ...p, phoneNumber: t }))}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  list: { width: '100%', paddingHorizontal: 15 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  memberInfo: {
    flex: 1,
    paddingRight: 12,
  },
  memberName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  memberPhone: { fontSize: 16, color: '#666' },

  buttonsColumn: {
    justifyContent: 'space-between',
    height: 88, // enough space for two buttons stacked
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  editButtonText: { color: '#fff', fontWeight: '600' },

  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: { color: '#fff', fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginRight: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 6,
    marginLeft: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '700',
  },
});