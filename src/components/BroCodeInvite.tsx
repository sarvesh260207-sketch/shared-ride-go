import { useState } from "react";
import { Link2, UserPlus, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BroContact {
  id: string;
  name: string;
  avatar: string;
  college?: string;
  connected: boolean;
}

const mockContacts: BroContact[] = [
  { id: "b1", name: "Vijay S", avatar: "VS", college: "MCC", connected: true },
  { id: "b2", name: "Deepak R", avatar: "DR", college: "MCC", connected: true },
  { id: "b3", name: "Sanjay K", avatar: "SK", college: "Loyola College", connected: false },
  { id: "b4", name: "Ravi M", avatar: "RM", college: "Anna University", connected: false },
  { id: "b5", name: "Kiran P", avatar: "KP", connected: false },
];

const BroCodeInvite = () => {
  const [contacts, setContacts] = useState<BroContact[]>(mockContacts);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const toggleConnect = (id: string) => {
    setContacts(prev =>
      prev.map(c => c.id === id ? { ...c, connected: !c.connected } : c)
    );
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.college && c.college.toLowerCase().includes(search.toLowerCase()))
  );

  const connectedCount = contacts.filter(c => c.connected).length;

  return (
    <section className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div
          onClick={() => setExpanded(!expanded)}
          className="zhoop-card p-5 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
                  Bro Code 🤜🤛
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect with your crew • {connectedCount} bro{connectedCount !== 1 ? 's' : ''} linked
                </p>
              </div>
            </div>
            <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              {expanded ? "Collapse" : "Expand"}
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Link your known college mates or commute buddies. When you both are on the same ride, you'll see the 🤜🤛 tag!
                  </p>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name or college..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Contact list */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filtered.map((contact) => (
                      <div
                        key={contact.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          contact.connected
                            ? "bg-primary/5 border-primary/20"
                            : "bg-card border-border hover:border-primary/10"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {contact.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{contact.name}</p>
                          {contact.college && (
                            <p className="text-xs text-muted-foreground">{contact.college}</p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleConnect(contact.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            contact.connected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          }`}
                        >
                          {contact.connected ? (
                            <>
                              <Check className="w-3 h-3" /> Linked
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" /> Link
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default BroCodeInvite;
