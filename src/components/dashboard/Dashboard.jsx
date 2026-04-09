function Dashboard({ children, className }) {
  return (
    <aside className={className}>
      {children}
    </aside>
  );
}

export default Dashboard;