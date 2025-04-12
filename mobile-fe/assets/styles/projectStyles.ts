import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    // Styles cho ProjectScreen
    container: { 
        flex: 1,
        backgroundColor: "#f0f2f5",
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 8,
    },
    header: { 
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginLeft: 8,
        marginBottom: 24,
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 80,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Styles cho ProjectItem
    projectCard: {
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { 
            width: 0, 
            height: 2 
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        backgroundColor: 'transparent',
        transform: [{ scale: 1 }],
    },
    projectCardPressed: {
        transform: [{ scale: 0.98 }],
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    cardGradient: {
        borderRadius: 20,
        padding: 16,
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    cardBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
    },
    cardContent: {
        position: 'relative',
        zIndex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginLeft: 8,
    },
    deleteButton: {
        padding: 4,
    },
    descriptionContainer: {
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#666',
    },
    membersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    membersText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#666',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 6,
    },

    // Styles cho Popup Menu
    popupOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,
        minWidth: 150,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemDanger: {
        borderBottomWidth: 0,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    menuTextDanger: {
        color: '#FF4D67',
    },

    // Thêm styles mới cho container của project item
    projectItemContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    projectItemWrapper: {
        borderRadius: 20,
        backgroundColor: 'transparent',
    },

    // Styles cho CreateProjectScreen và UpdateProjectScreen
    formContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    formSection: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1F2937',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dateInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1F2937',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    createButton: {
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#8B5CF6',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    createButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    addMemberButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    addMemberButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
    membersList: {
        marginTop: 8,
    },
    memberCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userName: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    removeButton: {
        padding: 8,
    },
    removeText: {
        fontSize: 20,
        color: '#EF4444',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '90%',
        maxHeight: '80%',
        padding: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1F2937',
        marginRight: 8,
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#6B7280',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    userInfo: {
        marginLeft: 12,
        flex: 1,
    },
    userEmail: {
        fontSize: 14,
        color: '#6B7280',
    },
    noResultText: {
        textAlign: 'center',
        color: '#6B7280',
        padding: 20,
    },
    moreButton: {
        padding: 4,
    },
});
